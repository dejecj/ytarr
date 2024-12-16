import { logger } from "./lib/logger"

console.log(process.env);

module.exports = {
  logger: () => {
    return logger
  }
}
