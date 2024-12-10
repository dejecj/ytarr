import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z, type ZodError } from "zod";

expand(config());

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  YOUTUBE_DATA_API_BASE_URL: z.string(),
  YOUTUBE_API_KEY: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line import/no-mutable-exports, ts/no-redeclare
let env: env;

try {
  // eslint-disable-next-line node/no-process-env
  env = EnvSchema.parse(process.env);
}
catch (e) {
  const error = e as ZodError;
  console.error("Invalid env:", error.flatten().fieldErrors);
  process.exit(1);
}

export default env;
