import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import env from "@/env";

export const pinoInstance = pino({
  level: env.LOG_LEVEL || "info",
}, env.NODE_ENV !== "production" ? pretty() : undefined);

export function pinoLogger() {
  return logger({
    pino: pinoInstance,
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
