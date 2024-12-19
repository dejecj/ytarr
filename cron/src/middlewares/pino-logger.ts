import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import env from "@/env";

export const pinoInstance = pino({
  level: env.LOG_LEVEL,
}, pino.multistream([
  { level: env.LOG_LEVEL, stream: pino.destination({ dest: '/config/logs/ytarr.txt', sync: false }) },
  { level: env.LOG_LEVEL, stream: env.NODE_ENV !== "production" ? pretty() : process.stdout },
]));

export function pinoLogger() {
  return logger({
    pino: pinoInstance.child({ module: "hono" }),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
