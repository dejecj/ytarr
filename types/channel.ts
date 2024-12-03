interface BaseChannel {
    name: string
    image: string
    monitored: boolean
    youtube_id: string
}

export interface Channel extends BaseChannel {
    id: string
    created: string
    updated: string
    collectionId: string
    collectionName: string
}

export interface CreateChannel extends BaseChannel {}

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