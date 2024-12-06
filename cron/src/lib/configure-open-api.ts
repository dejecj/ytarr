import { apiReference } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "@/lib/types";

import packageJSON from "package.json";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Ytarr Crons API",
    },
  });

  app.get(
    "/reference",
    apiReference({
      theme: "kepler",
      defaultHttpClient: {
        clientKey: "fetch",
        targetKey: "node",
      },
      spec: {
        url: "/doc",
      },
    }),
  );
}
