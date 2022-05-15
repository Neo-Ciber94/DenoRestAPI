import * as log from "std/log";
import { blue, bold, red, yellow } from "std/fmt/colors";
import { FileUtils } from "../utils/file-utils.ts";

const lOGS_PATH = "./logs/logs.txt";

const consoleHandler = new log.handlers.ConsoleHandler("DEBUG", {
  formatter: consoleFormatter,
});

const fileHandler = new log.handlers.RotatingFileHandler("WARNING", {
  filename: lOGS_PATH,
  formatter: (r) => {
    try {
      return fileFormatter(r);
    } finally {
      fileHandler.flush();
    }
  },
  maxBackupCount: 4,
  maxBytes: 419_4304, // 4 MB
});

if (FileUtils.createDirIfDontExist(lOGS_PATH)) {
  consoleHandler.log("Logs directory created");
}

await log.setup({
  handlers: {
    console: consoleHandler,
    file: fileHandler,
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console", "file"],
    },
  },
});

function fileFormatter(logRecord: log.LogRecord): string {
  const date = logRecord.datetime.toISOString();
  return `[${logRecord.levelName}] ${logRecord.msg} - ${date}`;
}

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

export default log;
