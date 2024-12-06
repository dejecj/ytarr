import { Worker } from "bullmq";
import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { pinoInstance as pino } from "@/middlewares/pino-logger";

const execAsync = promisify(exec);

// Create a worker to process jobs
export const channelWorker = new Worker(
  "channel-metadata",
  async (job) => {
    pino.info(`Processing job: ${job.name}-${job.id} with data:`, job.data);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (Math.random() < 0.1)
      throw new Error("Random error");
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
  console.error(`Job ${job?.id || "Unknown"} failed with error:`, err.message);
});

export const videoWorker = new Worker(
  "video-download",
  async (job) => {
    const { video } = job.data;
    pino.info(`Processing job: ${job.name}-${job.id} with data: ${JSON.stringify(job.data)}`);

    // Construct YouTube video URL
    const videoUrl = `https://www.youtube.com/watch?v=${video}`;

    try {
      // Download video using yt-dlp system command
      const downloadCommand = `yt-dlp -o "${video}.%(ext)s" "${videoUrl}"`;
      const { stderr } = await execAsync(downloadCommand);

      if (stderr) {
        pino.warn("yt-dlp stderr:", stderr);
      }

      pino.info(`Successfully downloaded video: ${video}`);

      return {
        videoId: video,
        downloadPath: path.resolve(process.cwd(), `${video}.mkv`),
      };
    }
    catch (error) {
      pino.error(`Error downloading video ${video}:`, error);
      throw error;
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

videoWorker.on("completed", (job) => {
  pino.info(`Job ${job.id} completed successfully.`);
});

videoWorker.on("failed", (job, err) => {
  pino.error(`Job ${job?.id || "Unknown"} failed with error:`, err.message);
});
