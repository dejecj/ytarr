import { channelWorker } from "./channel";
import { videoListSync, videoMonitor } from "./scheduler";
import { videoWorker } from "./video";

export const channel = channelWorker;
export const video = videoWorker;

videoMonitor.start();
videoListSync.start();
