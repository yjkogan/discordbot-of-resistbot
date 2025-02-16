// logger.js (Singleton Module)
// tracing MUST be imported before bunyan, otherwise the automatic
// instrumentation of bunyan doesn't work!
import "./tracing";

import bunyan, { LogLevelString } from "bunyan";

const ALLOWED_LOG_LEVELS: Set<LogLevelString> = new Set([
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
]);

const isValidLogLevel = (
  requestedLevel: string | undefined,
): requestedLevel is LogLevelString => {
  return ALLOWED_LOG_LEVELS.has(requestedLevel as LogLevelString);
};

let loggerInstance: ReturnType<typeof bunyan.createLogger> | null = null;

export const getInstance = () => {
  if (loggerInstance) {
    return loggerInstance;
  }
  const level: LogLevelString = isValidLogLevel(process.env.LOG_LEVEL)
    ? process.env.LOG_LEVEL
    : "info";

  const logger = bunyan.createLogger({
    name: "resistbot-discordbot",
    level,
  });
  loggerInstance = logger;
  return loggerInstance;
};
