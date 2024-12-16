import path from "node:path";
import pino from "pino";
import pretty from "pino-pretty";

const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const ENVIRONMENT = process.env.NODE_ENV || 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL,
}, pino.multistream([
  { level: LOG_LEVEL, stream: pino.destination(path.resolve(process.cwd(), "../logs.log")) },
  { level: LOG_LEVEL, stream: ENVIRONMENT !== "production" ? pretty() : process.stdout }
])).child({ module: 'ui' });