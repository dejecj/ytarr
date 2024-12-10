import Pocketbase from "pocketbase";
import { ChannelVideo } from "../../../ui/types/channel";
import { downloadVideo } from "@/queues";
import cron from 'node-cron';
import { pinoInstance as pino } from "@/middlewares/pino-logger";
const pb = new Pocketbase("http://localhost:8090");
pb.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

export const videoMonitor =
  cron.schedule('0 * * * *', async () => {
    pino.info('Running video monitor task.')
    let pendingVideos = await pb.collection('channel_videos').getFullList<ChannelVideo>({
      filter: 'monitored = true && status = "none"',
      sort: "+published"
    });

    for (let video of pendingVideos) {
      await downloadVideo({
        video: video.youtube_id
      });
      await pb.collection('channel_videos').update(video.id, {
        status: 'queued'
      });
    }
  });