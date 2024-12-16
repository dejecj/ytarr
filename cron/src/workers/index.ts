import { channelWorker } from "./channel";
import { garbageCollectionWorker } from "./garbage";
import { orphanedVideoCleanup, videoListSync, videoMonitor } from "./scheduler";
import { videoWorker } from "./video";

export const channel = channelWorker;
export const video = videoWorker;
export const garbage = garbageCollectionWorker;

videoMonitor.start();
videoListSync.start();
orphanedVideoCleanup.start();
