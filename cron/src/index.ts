import "@/workers";

import { serve } from "@hono/node-server";

import app from "@/app";
import env from "@/env";

import { pinoInstance } from "./middlewares/pino-logger";

const pino = pinoInstance.child({ module: "hono" });

const port = env.PORT;
pino.info(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
