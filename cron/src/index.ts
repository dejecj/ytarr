import "@/workers";

import { serve } from "@hono/node-server";

import app from "@/app";
import env from "@/env";

import { pinoInstance as pino } from "./middlewares/pino-logger";

const port = env.PORT;
pino.info(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
