import { Worker } from "bullmq";
import Pocketbase from "pocketbase";

import type { ChannelJob, YoutubeAPIResponse } from "@/lib/types";

import env from "@/env";
import { pinoInstance as pino } from "@/middlewares/pino-logger";

import type { Channel, ChannelVideo, CreateChannelVideo } from "../../../ui/types/channel";

const pb = new Pocketbase("http://localhost:8090");
pb.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

export const channelWorker = new Worker<ChannelJob>(
  "channel-metadata",
  async (job) => {
    pino.info(`Processing job: ${job.name}-${job.id} with data: ${JSON.stringify(job.data)}`);
    try {
      switch (job.name) {
        case "fetch-video-list": {
          const channelMetadata: Channel = await pb.collection("channels").getFirstListItem(`youtube_id = "${job.data.channel}"`);
          if (!channelMetadata)
            throw new Error("Video not found in library");

          const videoMetadata = await pb.collection("channel_videos").getList<ChannelVideo>(1, 1, {
            filter: `channel = "${channelMetadata.id}"`,
            sort: "-published",
          });

          let nextPageToken: string = "";
          do {
            const videoList = await fetch(`${env.YOUTUBE_DATA_API_BASE_URL}/playlistItems?playlistId=${channelMetadata.upload_playlist}&key=${env.YOUTUBE_API_KEY}&part=snippet,contentDetails&maxResults=50&pageToken=${nextPageToken}`);
            if (videoList.ok) {
              const listPayload: YoutubeAPIResponse = await videoList.json();

              const batch = pb.createBatch();
              for (const video of listPayload.items) {
                if (video.contentDetails.videoId === videoMetadata.items[0]?.youtube_id) {
                  await batch.send();
                  nextPageToken = "";
                  return;
                }

                let isMonitored = false;

                switch (channelMetadata.monitored) {
                  case "all":
                    isMonitored = true;
                    break;
                  case "future":
                    isMonitored = new Date(video.contentDetails.videoPublishedAt) > new Date(channelMetadata.created);
                    break;
                  case "none":
                    isMonitored = false;
                    break;
                }

                const newChannel: CreateChannelVideo = {
                  channel: channelMetadata.id,
                  status: "none",
                  youtube_id: video.contentDetails.videoId,
                  title: video.snippet.title,
                  description: video.snippet.description,
                  image: video.snippet.thumbnails.default.url,
                  published: video.contentDetails.videoPublishedAt,
                  monitored: isMonitored,
                };
                batch.collection("channel_videos").create(newChannel);
              }

              await batch.send();
              pino.info(`Video list page: ${listPayload.etag} processed successully`);
              nextPageToken = listPayload.nextPageToken;
            }
          } while (nextPageToken);
          break;
        }
      }
    }
    catch (e) {
      throw e;
    }
  },
  {
    connection: { host: "127.0.0.1", port: 6379 },
    concurrency: 1,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
);

channelWorker.on("completed", (job) => {
  pino.info(`Job ${job.id} completed successfully.`);
});

channelWorker.on("failed", (job, err) => {
  pino.error(`Job ${job?.id || "Unknown"} failed with error: ${err}`);
});
