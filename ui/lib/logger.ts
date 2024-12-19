import pino from "pino";
import pretty from "pino-pretty";

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ENVIRONMENT = process.env.NODE_ENV || 'production'

export const logger = pino({
  level: LOG_LEVEL,
}, pino.multistream([
  { level: LOG_LEVEL, stream: pino.destination("/config/logs/ytarr.txt") },
  { level: LOG_LEVEL, stream: ENVIRONMENT !== "production" ? pretty() : process.stdout }
])).child({ module: 'ui' });