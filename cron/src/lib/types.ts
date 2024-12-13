import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export interface ChannelJob {
  // type: 'fetch-video-channels' | 'update-channel-meta'
  channel: string;
}

export interface VideoJob {
  // type: 'download-video'
  video: string;
}

export interface YoutubeAPIResponse {
  kind: string
  etag: string
  nextPageToken: string
  regionCode: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  };
  items: {
    kind: string
    etag: string
    id: string
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
        medium: {
          url: string;
          width: number;
          height: number;
        };
        high: {
          url: string;
          width: number;
          height: number;
        };
        standard: {
          url: string;
          width: number;
          height: number;
        };
        maxres: {
          url: string;
          width: number;
          height: number;
        };
      };
      channelTitle: string;
      playlistId: string;
      position: 0;
      resourceId: {
        kind: string;
        videoId: string;
      };
      videoOwnerChannelTitle: string;
      videoOwnerChannelId: string;
    }
    contentDetails: {
      videoId: string;
      videoPublishedAt: string;
      duration: string
    }
    liveStreamingDetails: {
      actualStartTime: string,
      actualEndTime: string,
      scheduledStartTime: string,
    }
  }[];
}
