import { RootFolder } from "./fs"

interface BaseChannel {
    name: string
    image: string
    monitored: "all" | "none"
    youtube_id: string
    quality: "any" | "2160p" | "1080p" | "720p" | "480p" | "360p"
}

export interface Channel extends BaseChannel {
    id: string
    created: string
    updated: string
    collectionId: string
    collectionName: string
    root_folder: RootFolder
    expand?: Record<string, any>
}

export interface CreateChannel extends BaseChannel {
    root_folder: string
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
}

interface YoutubeChannelStatistics {
    "viewCount": number,
    "subscriberCount": number,
    "hiddenSubscriberCount": boolean,
    "videoCount": number
}

interface YoutTubeChannelBranding {
    channel: {
        title: string,
        description: string,
        keywords: string,
        unsubscribedTrailer: string,
        country: string,
    },
    image: {
        bannerExternalUrl: string
    }
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
        snippet: YoutubeChannel
    }[]
}