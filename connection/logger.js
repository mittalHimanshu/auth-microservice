// -------------------- Require Logger ----------------

const log4js = require("log4js");

// -------------------- Require Logger Enums ----------------

const {
  LOGS: { LOGSTASH_TYPE, LOG_APP_NAME, LOG_PATTERN, LOG_FILE_SIZE }
} = require("actyv/utils/enums");

// --------------------- Logger Config ----------------

log4js.configure({
  appenders: {
    // ----------------- Logstash Appender ----------------

    // logstash: {
    //   type: LOGSTASH_TYPE,
    //   url: process.env.ELASTIC_LOGSTASH_URL,
    //   application: LOG_APP_NAME
    // },

    // ----------------- Console Appender ----------------

    console: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: LOG_PATTERN
      }
    },

    // ------------------ File Appender ----------------

    file: {
      type: "file",
      filename: `actyv-logs.log`,
      maxLogSize: LOG_FILE_SIZE,
      compress: true
    }
  },

  categories: {
    default: { appenders: ["file"], level: "info" },
    console: { appenders: ["console"], level: "info" }
  }
});

// ------------------ Export Loggers ----------------

const logger = log4js.getLogger();
const consoleLogger = log4js.getLogger("console");

module.exports = { logger, consoleLogger };
