"use server"
import "server-only";
import { Channel, YoutubeChannel, YoutubeAPIResponse, CreateChannel, ChannelVideo } from "@/types/channel";
import { Response } from "@/types/actions";
import { ApiError, BaseError } from "@/types/errors";
import { createServerClient } from '@/lib/pocketbase';
import fs from "node:fs";
import { logger } from '@/lib/logger';

export const list = async () => {
    try {
        const pb = createServerClient();

        let channels: Channel[] = await pb.collection('channels').getFullList<Channel>({
            expand: 'root_folder'
        });

        channels = channels.map(c => {
            let c2 = {
                ...c,
                ...(c.expand || {})
            }
            delete c2.expand;
            return c2;
        });

        return new Response<Channel[]>("channel", channels).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel[], undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const getByYoutubeId = async (youtube_id: string) => {
    try {
        const pb = createServerClient();

        let channel = await pb.collection('channels').getFirstListItem<Channel>(`youtube_id = "${youtube_id}"`, {
            expand: 'root_folder'
        });

        if (!channel) {
            throw new Error('Channel not found');
        }

        channel = {
            ...channel,
            ...(channel.expand || {})
        }

        delete channel.expand;

        return new Response<Channel>("channel", channel).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const get = async (id: string) => {
    try {
        const pb = createServerClient();

        let channel: Channel = await pb.collection('channels').getOne<Channel>(id, {
            expand: 'root_folder'
        });

        channel = {
            ...channel,
            ...(channel.expand || {})
        }

        delete channel.expand;

        return new Response<Channel>("channel", channel).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const search = async (q: string) => {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?type=channel&q=${q}&key=${process.env.YOUTUBE_API_KEY}&part=snippet&maxResults=20`);

        let channels: YoutubeChannel[];
        if (response.ok) {
            let payload: YoutubeAPIResponse = await response.json();
            channels = payload.items.map(i => i.snippet);
        } else {
            const error = new Error(`Failed to fetch Youtube channels`)
            const errorResponse = await response.json();
            throw Object.assign(error, errorResponse);
        }
        return new Response<YoutubeChannel[]>("channel", channels).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<YoutubeChannel[], undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const add = async (channel: CreateChannel) => {
    try {
        let validationErrors: string[] = [];
        if (!channel.root_folder) validationErrors.push("Root Folder is required");
        if (!channel.youtube_id) validationErrors.push("Youtube ID is required");
        if (!channel.description && channel.description !== "") validationErrors.push("Description is required");
        if (!channel.image) validationErrors.push("Image is required");
        if (!channel.monitored) validationErrors.push("Monitored option is required");
        if (!channel.name) validationErrors.push("Name is required");
        if (!channel.quality) validationErrors.push("Quality is required");

        if (validationErrors.length) throw new Error(validationErrors.join("\n"));

        const pb = createServerClient();

        let youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?id=${channel.youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,brandingSettings`);
        let youtubeChannel;
        if (youtubeResponse.ok) {
            let payload: YoutubeAPIResponse = await youtubeResponse.json();
            youtubeChannel = payload.items[0];
        } else {
            const error = new Error(`Failed to fetch Youtube channel`)
            const errorResponse = await youtubeResponse.json();
            throw Object.assign(error, errorResponse);
        }

        let newChannel = await pb.collection('channels').create<Channel>({
            ...channel,
            description: youtubeChannel.snippet.description,
            slug: youtubeChannel.snippet.customUrl,
            published: youtubeChannel.snippet.publishedAt,
            video_count: youtubeChannel.statistics.videoCount,
            subscriber_count: youtubeChannel.statistics.subscriberCount,
            view_count: youtubeChannel.statistics.viewCount,
            upload_playlist: youtubeChannel.contentDetails.relatedPlaylists.uploads,
            keywords: youtubeChannel.brandingSettings.channel.keywords,
            banner_image: youtubeChannel.brandingSettings.image?.bannerExternalUrl || ""
        }, {
            expand: 'root_folder'
        });

        newChannel = {
            ...newChannel,
            ...(newChannel.expand || {})
        }

        delete newChannel.expand;


        let syncVideoJob = await fetch('http://localhost:9999/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'update-video-list',
                channel: newChannel.youtube_id
            })
        });

        if (!syncVideoJob.ok) {
            let error = new Error('Ran into a problem adding video sync job');
            let errorResponse = await syncVideoJob.json();
            logger.warn(Object.assign(error, errorResponse));
        }

        const basePath = `${newChannel.root_folder.path}/${newChannel.name}`;

        try {
            const nfoContent = generateChannelNFO(newChannel);
            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true });
            }
            fs.writeFileSync(`${basePath}/tvshow.nfo`, nfoContent);
        }
        catch (e) {
            logger.warn(e);
        }

        try {
            if (channel.image) {
                const imageReponse = await fetch(channel.image);
                if (!imageReponse.ok) throw new Error('Ran into a problem downloading channel thumbnail');
                const buffer = Buffer.from(await imageReponse.arrayBuffer());
                if (!fs.existsSync(basePath)) {
                    fs.mkdirSync(basePath, { recursive: true });
                }
                fs.writeFileSync(`${basePath}/folder.jpg`, buffer);
            }
        }
        catch (e) {
            logger.warn(e);
        }

        return new Response<Channel>("channel", newChannel).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<Channel, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const remove = async (id: string) => {
    try {
        const pb = createServerClient();

        try {
            const batch = pb.createBatch();
            let videos = await pb.collection('channel_videos').getFullList({
                filter: `channel = "${id}"`,
                fields: 'id'
            });

            for (let video of videos) {
                batch.collection('channel_videos').delete(video.id);
            }

            await batch.send();
        } catch (e) {
            logger.warn(e);
        }

        let deleted = await pb.collection('channels').delete(id);

        if (!deleted) throw new Error("We ran into a problem removing channel");

        return new Response<string>("channel", id).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<string, undefined, BaseError>("channel", id, undefined, error).toJSON();
    }
}

export const listAllVideos = async (channel: string) => {
    try {
        const pb = createServerClient();

        let videos = await pb.collection('channel_videos').getFullList<ChannelVideo>({
            filter: `channel = "${channel}"`,
            sort: '-published'
        });

        return new Response<ChannelVideo[]>("video", videos).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<ChannelVideo[], undefined, BaseError>("video", undefined, undefined, error).toJSON();
    }
}

export const downloadVideo = async (youtube_id: string) => {
    try {
        const pb = createServerClient();

        let video = await pb.collection('channel_videos').getFirstListItem<ChannelVideo>(`youtube_id = "${youtube_id}"`);

        let videoDownloadJob = await fetch('http://localhost:9999/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'download-video',
                video: video.youtube_id
            })
        });

        if (!videoDownloadJob.ok) {
            let error = new Error('We ran into a problem starting video download.');
            let errorResponse = await videoDownloadJob.json();
            throw Object.assign(error, errorResponse);
        }

        return new Response<ChannelVideo>("video", video).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<ChannelVideo, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

export const changeVideoMonitorStatus = async (id: string, status: boolean) => {
    try {
        const pb = createServerClient();

        let video = await pb.collection('channel_videos').update<ChannelVideo>(id, {
            monitored: status
        });

        return new Response<ChannelVideo>("channel", video).toJSON();
    } catch (e) {
        logger.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<ChannelVideo, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}

const generateChannelNFO = (channel: Channel): string => {
    const publishedDate = new Date(channel.published);
    const formatDate = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    const escapeXml = (unsafe: string): string => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    const nfoContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <tvshow>
    <title>${escapeXml(channel.name)}</title>
    <plot>${escapeXml(channel.description)}</plot>
    <premiered>${formatDate(publishedDate)}</premiered>
    <aired>${formatDate(publishedDate)}</aired>
    <uniqueid type="youtube" default="true">${escapeXml(channel.youtube_id)}</uniqueid>
  </tvshow>`;

    return nfoContent;
}