import * as log from "https://deno.land/std@0.138.0/log/mod.ts";
import { dirname } from "https://deno.land/std@0.138.0/path/mod.ts";
import {
  blue,
  bold,
  red,
  yellow,
} from "https://deno.land/std@0.95.0/fmt/colors.ts";

const lOGS_PATH = "./logs/logs.txt";

createDirIfDontExist(lOGS_PATH);

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: consoleFormatter,
    }),
    file: new log.handlers.RotatingFileHandler("WARNING", {
      filename: "./logs/logs.txt",
      maxBackupCount: 12,
      maxBytes: 800000,
    }),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console", "file"],
    },
  },
});

function consoleFormatter(logRecord: log.LogRecord): string {
  const date = logRecord.datetime.toISOString();
  let msg = `[${logRecord.levelName}] ${logRecord.msg} - ${date}`;

  switch (logRecord.level) {
    case log.LogLevels.INFO:
      msg = blue(msg);
      break;
    case log.LogLevels.WARNING:
      msg = yellow(msg);
      break;
    case log.LogLevels.ERROR:
      msg = red(msg);
      break;
    case log.LogLevels.CRITICAL:
      msg = bold(red(msg));
      break;
    default:
      break;
  }

  return msg;
}

function createDirIfDontExist(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch {
    const dir = dirname(path);
    Deno.mkdirSync(dir, {
      recursive: true,
    });
    return false;
  }
}

export default log;
