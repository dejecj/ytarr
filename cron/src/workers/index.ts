import { channelWorker } from "./channel";
import { videoWorker } from "./video";
import { videoMonitor, videoListSync } from './scheduler';

export const channel = channelWorker;
export const video = videoWorker;

videoMonitor.start();
videoListSync.start();