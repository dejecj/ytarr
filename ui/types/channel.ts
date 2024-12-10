import { RootFolder } from "./fs"

type VideoQuality = 'any' | '2160p' | '1080p' | '720p' | '480p' | '360p';

interface BaseChannel {
    name: string
    image: string
    monitored: "all" | "none"
    youtube_id: string
    quality: VideoQuality
    description: string;
}

export interface Channel extends BaseChannel {
    id: string
    created: string
    updated: string
    collectionId: string
    collectionName: string
    root_folder: RootFolder,
    slug: string;
    published: string;
    video_count: number;
    subscriber_count: number;
    view_count: number;
    upload_playlist: string;
    keywords: string;
    banner_image: string;
    expand?: Record<string, any>
}

export interface CreateChannel extends BaseChannel {
    root_folder: string
}

interface BaseChannelVideo {
    youtube_id: string
    title: string
    image: string
    description: string
    published: string
    status: 'none' | 'queued' | 'downloading' | 'finished'
    quality?: VideoQuality
    progress?: number
}

export interface ChannelVideo extends BaseChannelVideo {
    id: string
    created: string
    updated: string
    collectionId: string
    collectionName: string
    expand?: Record<string, any>
    channel: Channel
}

export interface CreateChannelVideo extends BaseChannelVideo {
    channel: string
}

export interface YoutubeChannel {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
        default: {
            url: string
        }
        medium: {
            url: string
        }
        high: {
            url: string
        }
    }
    channelTitle: string
    liveBroadcastContent: string
    publishTime: string
    customUrl: string
}

export interface YoutubeAPIResponse {
    kind: string
    etag: string
    nextPageToken: string
    regionCode: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
    items: {
        kind: string
        etag: string
        id: {
            kind: string
            channelId: string
        }
        snippet: YoutubeChannel,
        contentDetails: {
            relatedPlaylists: {
                likes: string,
                uploads: string,
            }
        },
        statistics: {
            viewCount: string,
            subscriberCount: string,
            hiddenSubscriberCount: false,
            videoCount: string,
        },
        brandingSettings: {
            channel: {
                title: string,
                description: string,
                keywords: string,
                trackingAnalyticsAccountId: string,
                unsubscribedTrailer: string,
                country: string,
            },
            image: {
                bannerExternalUrl: string,
            }
        }
    }[]
}