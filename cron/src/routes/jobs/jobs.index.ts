import { createRouter } from "@/lib/create-app";

import * as handlers from "./jobs.handlers";
import * as routes from "./jobs.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create);

export default router;
