import cron from "node-cron";
import Pocketbase from "pocketbase";

import type { YoutubeAPIResponse } from "@/lib/types";

import env from "@/env";
import { pinoInstance } from "@/middlewares/pino-logger";
import {
  cleanupDownloadMetadata,
  cleanupOrphanedVideos,
  downloadVideo,
  fetchVideoList,
} from "@/queues";

import type { Channel, ChannelVideo } from "../../../ui/types/channel";

const pino = pinoInstance.child({ module: "cron::scheduler" });

const pb = new Pocketbase("http://localhost:8090");
pb.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

export const videoMonitor
  = cron.schedule("*/5 * * * *", async () => {
    pino.info("Running video monitor task.");
    // IMPORTANT: This monitor can only queue up a maximum of 50 videos per minute.
    // This is done to avoid complex pagination logic in this function and increase predictability.
    // Any additional videos will just get process in the next execution only 1 minute away.
    const pendingVideos = await pb.collection("channel_videos").getList<ChannelVideo>(1, 50, {
      filter: `monitored = true && status = \"none\" && channel.monitored != \"none\" && (channel.ignore_shorts != true || is_short = false) && (live_scheduled_date = '' || live_scheduled_date < '${new Date().toISOString().replace("T", " ")}')`,
      sort: "+published",
    });

    if (!pendingVideos.items.length)
      return;

    const videoDetails = await fetch(`${env.YOUTUBE_DATA_API_BASE_URL}/videos?id=${pendingVideos.items.map(pv => pv.youtube_id).join(",")}&key=${env.YOUTUBE_API_KEY}&part=liveStreamingDetails&maxResults=50`);

    const videoDetailsPayload: YoutubeAPIResponse = await videoDetails.json();

    for (const video of pendingVideos.items) {
      if (video.is_live && !video.is_live_finished) {
        if (!videoDetails.ok)
          continue;
        const videoDetail = videoDetailsPayload.items.find(i => i.id === video.youtube_id);
        if (!videoDetail)
          continue;
        if (!videoDetail.liveStreamingDetails?.actualEndTime)
          continue;
        await pb.collection("channel_videos").update<ChannelVideo>(video.id, {
          is_live_complete: true,
        });
      }
      await downloadVideo({
        video: video.youtube_id,
      });
      await pb.collection("channel_videos").update(video.id, {
        status: "queued",
      });
    }
  });

export const videoListSync
  = cron.schedule("0 * * * *", async () => {
    pino.info("Running video list sync task.");
    const channels = await pb.collection("channels").getFullList<Channel>();

    for (const channel of channels) {
      await fetchVideoList({
        channel: channel.youtube_id,
      });
    }
  });

export const orphanedVideoCleanup
  = cron.schedule("0 */6 * * *", async () => {
    pino.info("Running orphaned video cleanup task.");
    await cleanupOrphanedVideos();
  });

export const downloadMetadataCleanup
  = cron.schedule("0 */6 * * *", async () => {
    pino.info("Running orphaned video cleanup task.");
    await cleanupDownloadMetadata();
  });
