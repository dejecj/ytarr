"use server"
import "server-only";
import { Channel, YoutubeChannel, YoutubeAPIResponse, CreateChannel, ChannelVideo } from "@/types/channel";
import { Response } from "@/types/actions";
import { ApiError, BaseError } from "@/types/errors";
import { createServerClient } from '@/lib/pocketbase';

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
            throw new Error(`Failed to fetch Youtube channels. Error: ${response.statusText}`)
        }
        return new Response<YoutubeChannel[]>("channel", channels).toJSON();
    } catch (e) {
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
            throw new Error(`Failed to fetch Youtube channel. Error: ${youtubeResponse.statusText}`)
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
            console.error(JSON.stringify(await syncVideoJob.json()));
        }

        return new Response<Channel>("channel", newChannel).toJSON();
    } catch (e) {
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
        } catch (err) { }

        let deleted = await pb.collection('channels').delete(id);

        if (!deleted) throw new Error("We ran into a problem removing channel");

        return new Response<string>("channel", id).toJSON();
    } catch (e) {
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
            console.error(await videoDownloadJob.json());
            throw new Error(`We ran into a problem starting video download.`);
        }

        return new Response<ChannelVideo>("video", video).toJSON();
    } catch (e) {
        console.error(e);
        const error = new ApiError<BaseError>(e as Error).toJSON();
        return new Response<ChannelVideo, undefined, BaseError>("channel", undefined, undefined, error).toJSON();
    }
}