import { Worker } from "bullmq";

import type { ChannelJob, YoutubeAPIResponse } from "@/lib/types";

import env from "@/env";
import { pinoInstance } from "@/middlewares/pino-logger";

import type { Channel, ChannelVideo, CreateChannelVideo } from "../../../ui/types/channel";
import { pb } from "@/lib/pocketbase";
import { YOUTUBE_DATA_API_BASE_URL } from "@/lib/constants";
const pino = pinoInstance.child({ module: "cron::channel-worker" });

export const channelWorker = new Worker<ChannelJob>(
  "channel-metadata",
  async (job) => {
    pino.info(`Processing job: ${job.name}-${job.id} with data: ${JSON.stringify(job.data)}`);
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
          const videoList = await fetch(`${YOUTUBE_DATA_API_BASE_URL}/playlistItems?playlistId=${channelMetadata.upload_playlist}&key=${env.YOUTUBE_API_KEY}&part=snippet,contentDetails&maxResults=50&pageToken=${nextPageToken}`);
          if (videoList.ok) {
            const listPayload: YoutubeAPIResponse = await videoList.json();

            const additionalVideoDetails = await fetch(`${YOUTUBE_DATA_API_BASE_URL}/videos?id=${listPayload.items.map(pi => pi.contentDetails.videoId).join(",")}&key=${env.YOUTUBE_API_KEY}&part=contentDetails,liveStreamingDetails&maxResults=50`);

            const additionalVideoDetailsPayload: YoutubeAPIResponse = await additionalVideoDetails.json();

            if (!additionalVideoDetails.ok)
              pino.warn(additionalVideoDetailsPayload);

            const batch = pb.createBatch();
            let batchSize = 0;
            for (const video of listPayload.items) {
              if (video.contentDetails.videoId === videoMetadata.items[0]?.youtube_id) {
                pino.debug(`Video: ${video.contentDetails.videoId} found in library. We reached the most recent video in our collection and will now exit the loop without adding the rest of this page or remaining pages.`);
                if (batchSize > 0)
                  await batch.send();
                nextPageToken = "";
                return;
              }

              // Handles edge case where youtube switches the order of videos around in the response
              // Tends to happen with scheduled live streams when they start streaming
              try {
                await pb.collection("channel_videos").getFirstListItem(`youtube_id = "${video.contentDetails.videoId}"`);
                continue;
              }
              catch (err) {
                pino.debug("Video not in library, proceding with sync.");
                pino.debug(err);
              }

              let isMonitored = false;

              const additionalDetails = additionalVideoDetails.ok ? additionalVideoDetailsPayload.items.find(v => v.id === video.contentDetails.videoId) : null;

              let isShort = false;
              let isLive = false;
              let isLiveFinished = false;
              let liveScheduledDate: string = "";
              if (additionalDetails) {
                isShort = !additionalDetails.liveStreamingDetails?.scheduledStartTime && parseYoutubeDuration(additionalDetails.contentDetails.duration) < 180;
                isLive = !!additionalDetails.liveStreamingDetails?.scheduledStartTime;
                isLiveFinished = !!additionalDetails.liveStreamingDetails?.actualEndTime;
                if (isLive)
                  liveScheduledDate = additionalDetails.liveStreamingDetails.scheduledStartTime;
              }

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

              if (isShort && channelMetadata.ignore_shorts)
                isMonitored = false;

              const newChannel: CreateChannelVideo = {
                channel: channelMetadata.id,
                status: "none",
                youtube_id: video.contentDetails.videoId,
                title: video.snippet.title,
                description: video.snippet.description,
                image: video.snippet.thumbnails.default.url,
                published: video.contentDetails.videoPublishedAt,
                monitored: isMonitored,
                is_short: isShort,
                is_live: isLive,
                is_live_finished: isLiveFinished,
                live_scheduled_date: liveScheduledDate,
              };
              batch.collection("channel_videos").create(newChannel);
              batchSize++;
            }
            if (batchSize > 0)
              await batch.send();
            pino.info(`Video list page: ${listPayload.etag} processed successully`);
            nextPageToken = listPayload.nextPageToken;
          }
          else {
            pino.error(await videoList.json());
          }
        } while (nextPageToken);
        break;
      }
      case "cleanup-orphaned-videos": {
        const orphanedVideos = await pb.collection("channel_videos").getFullList<ChannelVideo>({
          filter: `channel = ""`,
        });
        for (const video of orphanedVideos) {
          await pb.collection("channel_videos").delete(video.id);
        }
        break;
      }
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

function parseYoutubeDuration(durationStr: string) {
  // Remove 'PT' prefix
  durationStr = durationStr.replace("PT", "");

  // If empty, return 0
  if (!durationStr)
    return 0;

  let totalSeconds = 0;

  // Match hours
  const hoursMatch = durationStr.match(/(\d+)H/);
  if (hoursMatch) {
    totalSeconds += Number.parseInt(hoursMatch[1]) * 3600;
  }

  // Match minutes
  const minutesMatch = durationStr.match(/(\d+)M/);
  if (minutesMatch) {
    totalSeconds += Number.parseInt(minutesMatch[1]) * 60;
  }

  // Match seconds
  const secondsMatch = durationStr.match(/(\d+)S/);
  if (secondsMatch) {
    totalSeconds += Number.parseInt(secondsMatch[1]);
  }

  return totalSeconds;
}
