import { Queue } from "bullmq";
import crypto from "node:crypto";

import type { ChannelJob, VideoJob } from "@/lib/types";

// Function to create a unique hash for deduplication
function hashData(data: any): string {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

const channelMetadataDataQueue = new Queue<ChannelJob>("channel-metadata", {
  connection: { host: "127.0.0.1", port: 6379 },
});
const videoDownloadQueue = new Queue("video-download", {
  connection: { host: "127.0.0.1", port: 6379 },
});

export async function fetchVideoList(data: ChannelJob) {
  const jobId = hashData(data);
  await channelMetadataDataQueue.add("fetch-video-list", data, {
    jobId,
    removeOnComplete: true,
    removeOnFail: true,
  });
}

export async function updateChannelMetadata(data: ChannelJob) {
  const jobId = hashData(data);
  await channelMetadataDataQueue.add("update-channel-metadata", data, {
    jobId,
    removeOnComplete: true,
    removeOnFail: true,
  });
}

export async function downloadVideo(data: VideoJob) {
  const jobId = hashData(data);
  await videoDownloadQueue.add("download-video", data, {
    jobId,
    removeOnComplete: true,
    removeOnFail: true,
  });
}
