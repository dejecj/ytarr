import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import jobs from "@/routes/jobs/jobs.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  jobs,
];

routes.forEach((route) => {
  app.route("/", route);
});

export default app;
