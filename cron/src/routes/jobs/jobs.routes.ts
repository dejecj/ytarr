import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema } from "stoker/openapi/schemas";

const tags = ["Jobs"];

const JobCreateSchema = z.object({
  type: z.enum(["update-video-list", "update-channel-meta", "download-video"]),
  channel: z.string().min(1).optional().describe("Required if type is 'update-channel-meta' or 'update-video-list'"),
  video: z.string().optional().describe("Required if type is 'download-video'"),
}).superRefine((input, ctx) => {
  if (["update-video-list", "update-channel-meta"].includes(input.type) && !input.channel) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["channel"],
      message: "Required when type is 'update-channel-meta' or 'update-video-list'",
    });
  }

  if (input.type === "download-video" && !input.video) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["video"],
      message: "Required when type is 'download-video'",
    });
  }
});

export const create = createRoute({
  tags,
  path: "/jobs",
  method: "post",
  request: {
    body: jsonContentRequired(
      JobCreateSchema,
      "The job to create",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("Job added successfully"),
      "Create a new job",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(JobCreateSchema),
      "Invalid Job",
    ),
  },
});

export type CreateRoute = typeof create;
