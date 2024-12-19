import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import * as Jobs from "@/queues";

import type { CreateRoute } from "./jobs.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const jobData = c.req.valid("json");
  switch (jobData.type) {
    case "download-video": {
      await Jobs.downloadVideo({
        video: jobData.video as string,
      });
      break;
    }
    case "update-channel-meta": {
      await Jobs.updateChannelMetadata({
        channel: jobData.channel as string,
      });
      break;
    }
    case "update-video-list": {
      await Jobs.fetchVideoList({
        channel: jobData.channel as string,
      });
      break;
    }
  }
  return c.json({ message: "Job added succesfully" }, HttpStatusCodes.OK);
};
