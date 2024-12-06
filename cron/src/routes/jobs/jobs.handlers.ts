import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import * as Jobs from "@/queues";

import type { CreateRoute } from "./jobs.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const jobData = c.req.valid("json");
  switch (jobData.type) {
    case "download-video": {
      await Jobs.downloadVideo({
        channel: jobData.channel,
        video: jobData.video,
      });
      break;
    }
    case "update-channel-meta": {
      await Jobs.updateChannelMetadata({
        channel: jobData.channel,
      });
      break;
    }
    case "update-video-list": {
      await Jobs.fetchVideoList({
        channel: jobData.channel,
        playlist: jobData.playlist,
      });
      break;
    }
  }
  return c.json({ message: "Job added succesfully" }, HttpStatusCodes.OK);
};
