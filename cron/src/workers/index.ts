import { channelWorker } from "./channel";
import { videoListSync, videoMonitor, orphanedVideoCleanup } from "./scheduler";
import { videoWorker } from "./video";
import { garbageCollectionWorker } from './garbage';

export const channel = channelWorker;
export const video = videoWorker;
export const garbage = garbageCollectionWorker;

videoMonitor.start();
videoListSync.start();
orphanedVideoCleanup.start();