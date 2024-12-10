import { Worker } from "bullmq";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import Pocketbase from "pocketbase";

import type { ChannelJob, VideoJob, YoutubeAPIResponse } from "@/lib/types";

import env from "@/env";
import { pinoInstance as pino } from "@/middlewares/pino-logger";

import type { Channel, ChannelVideo, CreateChannelVideo } from "../../ui/types/channel";

const pb = new Pocketbase("http://localhost:8090");
pb.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

// Create a worker to process jobs
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

          let videoMetadata = await pb.collection("channel_videos").getList<ChannelVideo>(1, 1, {
            sort: '-published'
          });

          let nextPageToken: string = "";
          do {
            const videoList = await fetch(`${env.YOUTUBE_DATA_API_BASE_URL}/playlistItems?playlistId=${channelMetadata.upload_playlist}&key=${env.YOUTUBE_API_KEY}&part=snippet,contentDetails&maxResults=50&pageToken=${nextPageToken}`);
            if (videoList.ok) {
              const listPayload: YoutubeAPIResponse = await videoList.json();

              const batch = pb.createBatch();
              for (const video of listPayload.items) {
                if (video.contentDetails.videoId == videoMetadata.items[0]?.youtube_id) {
                  await batch.send();
                  nextPageToken = "";
                  return;
                }
                const newChannel: CreateChannelVideo = {
                  channel: channelMetadata.id,
                  status: "none",
                  youtube_id: video.contentDetails.videoId,
                  title: video.snippet.title,
                  description: video.snippet.description,
                  image: video.snippet.thumbnails.default.url,
                  published: video.contentDetails.videoPublishedAt,
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
      pino.error(e);
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

export const videoWorker = new Worker<VideoJob>(
  "video-download",
  async (job) => {
    const { video } = job.data;
    pino.info(`Processing job: ${job.id}`);
    pino.info(JSON.stringify(job.data));

    let videoMetadata: ChannelVideo = await pb.collection("channel_videos").getFirstListItem(`youtube_id = "${job.data.video}"`, {
      expand: 'channel,channel.root_folder'
    });

    videoMetadata = {
      ...videoMetadata,
      ...(videoMetadata.expand || {})
    }

    videoMetadata.channel = {
      ...videoMetadata.channel,
      ...(videoMetadata.channel.expand || {}),
    }

    if (!videoMetadata)
      throw new Error("Video not found in library");

    const basePath = `${videoMetadata.channel.root_folder.path}/${videoMetadata.channel.name}`

    return new Promise((resolve, reject) => {
      // Spawn yt-dlp as a child process with progress output
      const downloadProcess = spawn("yt-dlp", [
        `-o "${basePath}/.tmp/${videoMetadata.title}.%(ext)s"`,
        "-f",
        "bestvideo+bestaudio/best",
        "--merge-output-format",
        "mkv",
        "--progress",
        "--newline",
        "--embed-metadata",
        `-S \"res:${videoMetadata.channel.quality.replace('p', '')},fps\"`,
        "--write-info-json",
        "--write-thumbnail",
        `--exec "mv '${basePath}'/.tmp/'%(title)s'.mkv ${basePath}"`,
        `--exec "mv '${basePath}'/.tmp/'%(title)s'.webp ${basePath}"`,
        video,
      ], {
        shell: true, // Use shell to properly handle quoted arguments
      });

      let downloadPath = "";
      let errorOutput = "";
      let selectedFormatId = "";

      // Handle stdout for progress updates
      downloadProcess.stdout.on("data", async (data) => {
        const output = data.toString().trim();
        pino.info(`Full stdout: ${output}`);

        // Extract the selected format ID from the download line
        const formatMatch = output.match(/Downloading \d+ format\(s\): (\d+)\+(\d+)/);
        if (formatMatch) {
          selectedFormatId = formatMatch[1]; // Get the first part of the format (e.g., 398)
        }

        // Parse progress information
        const progressMatch = output.match(/(\d+\.\d+)%\s*of\s*([\d.]+(?:[A-Z_a-z]\w*|\d))\s*at\s*([\d.]+(?:[A-Z_a-z]\w*|\d)\/s)/);
        if (progressMatch) {
          const [, percent] = progressMatch;
          try {
            await pb.collection("channel_videos").update(videoMetadata.id, {
              status: "downloading",
              progress: percent,
            });
          }
          catch (e) {
            pino.warn((e as Error).message);
            pino.debug(e);
          }
        }

        // Capture filename when download starts
        const filenameMatch = output.match(/\[download\] Destination: (.+)/);
        if (filenameMatch) {
          downloadPath = path.resolve(process.cwd(), filenameMatch[1]);
        }
      });

      // Collect stderr for detailed error logging
      downloadProcess.stderr.on("data", (data) => {
        const errorStr = data.toString();
        errorOutput += errorStr;
      });

      // Handle successful completion
      downloadProcess.on("close", async (code) => {
        if (code === 0) {
          pino.info(`Successfully downloaded video: ${video}`);

          // Read the .info.json file to get the quality (format_note)
          try {
            interface formatObject {
              format_note: string;
              format_id: string;
            }
            const infoJsonPath = path.resolve(process.cwd(), `${basePath}/.tmp/${videoMetadata.title}.info.json`);
            const infoJson = JSON.parse(fs.readFileSync(infoJsonPath, "utf-8"));
            const selectedFormat = infoJson.formats.find((format: formatObject) => format.format_id.toString() === selectedFormatId);
            const quality = selectedFormat ? selectedFormat.format_note : "Unknown";

            // Update the video metadata with the quality (e.g., 720p)
            await pb.collection("channel_videos").update(videoMetadata.id, {
              status: "finished",
              quality,
            });
          }
          catch (e) {
            pino.error("Error reading .info.json or extracting quality:", e);
          }

          try {
            fs.rmSync(path.resolve(process.cwd(), `${basePath}/.tmp/*`), {
              recursive: true,
              force: true
            });
          }
          catch (e) {
            pino.error(e)
          }

          resolve({
            videoId: video,
            downloadPath,
          });
        }
        else {
          const error = new Error(`yt-dlp download failed with code ${code}`);
          pino.error(errorOutput);
          await pb.collection("channel_videos").update(videoMetadata.id, {
            status: "none",
            progress: 0,
          });
          reject(Object.assign(error, {
            code,
            errorOutput,
            jobData: job.data,
          }));
        }
      });

      // Handle errors
      downloadProcess.on("error", (error) => {
        pino.error(`Error spawning yt-dlp for video ${video}:`);
        pino.error(error);
        reject(error);
      });
    });
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
  pino.error(`Job ${job?.id || "Unknown"} failed with error: ${err.message}`);
});
