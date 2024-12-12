import cron from "node-cron";
import Pocketbase from "pocketbase";

import { pinoInstance as pino } from "@/middlewares/pino-logger";
import { downloadVideo, fetchVideoList } from "@/queues";

import type { Channel, ChannelVideo } from "../../../ui/types/channel";

const pb = new Pocketbase("http://localhost:8090");
pb.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

export const videoMonitor
  = cron.schedule("* * * * *", async () => {
    pino.info("Running video monitor task.");
    const pendingVideos = await pb.collection("channel_videos").getFullList<ChannelVideo>({
      filter: "monitored = true && status = \"none\" && channel.monitored != \"none\"",
      sort: "+published",
    });

    for (const video of pendingVideos) {
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
