import { Worker } from "bullmq";
import Pocketbase from "pocketbase";
import fs from "node:fs";
import path from "node:path";

import env from "@/env";
import { pinoInstance as pino } from "@/middlewares/pino-logger";

import type { Channel, ChannelVideo, CreateChannelVideo } from "../../../ui/types/channel";
import { RootFolder } from "../../../ui/types/fs";

const pb = new Pocketbase("http://localhost:8090");
pb.collection("_superusers").authWithPassword("admin@ytarr.local", "admin_ytarr");

export const garbageCollectionWorker = new Worker(
  "garbage-collection",
  async (job) => {
    pino.info(`Processing job: ${job.name}-${job.id} with data: ${JSON.stringify(job.data)}`);
    switch (job.name) {
      case "cleanup-orphaned-videos": {
        const orphanedVideos = await pb.collection("channel_videos").getFullList<ChannelVideo>({
          filter: `channel = ""`
        });
        for (let video of orphanedVideos) {
          await pb.collection('channel_videos').delete(video.id);
        }
        break;
      }
      case "cleanup-download-metadata": {
        const deleteFilesInDirectory = async (dirPath: string) => {
          try {
            const files = fs.readdirSync(dirPath);

            for (const file of files) {
              const filePath = path.join(dirPath, file);
              const stats = fs.lstatSync(filePath);

              if (stats.isFile()) {
                fs.unlinkSync(filePath); // Delete the file
              }
            }

            pino.info(`Cleared contents of: ${dirPath}`);
          } catch (e) {
            pino.error(`Error deleting files in directory ${dirPath}:`);
            pino.error(e);
          }
        }

        /**
         * Recursively traverses a directory and finds .tmp folders to clear their contents.
         * @param {string} basePath - Path to the base directory.
         */
        const traverseAndClearTmpFolders = async (basePath: string) => {
          try {
            const entries = fs.readdirSync(basePath, { withFileTypes: true });

            for (const entry of entries) {
              const entryPath = path.join(basePath, entry.name);

              if (entry.isDirectory()) {
                if (entry.name === '.tmp') {
                  // Clear contents of the .tmp folder
                  await deleteFilesInDirectory(entryPath);
                } else {
                  // Recursively traverse subdirectories
                  await traverseAndClearTmpFolders(entryPath);
                }
              }
            }
          } catch (e) {
            pino.error(`Error traversing directory ${basePath}:`);
            pino.error(e)
          }
        }

        const rootFolders = await pb.collection('root_folders').getFullList<RootFolder>();

        for (let folder of rootFolders) {
          await traverseAndClearTmpFolders(folder.path);
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

garbageCollectionWorker.on("completed", (job) => {
  pino.info(`Job ${job.id} completed successfully.`);
});

garbageCollectionWorker.on("failed", (job, err) => {
  pino.error(`Job ${job?.id || "Unknown"} failed with error: ${err}`);
});
