const winston = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logDir = path.join(__dirname, "../../logs");

// Custom format for development console output
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  align(),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Structured JSON format for production log files
const prodFormat = combine(
  timestamp(),
  json()
);

const transports = [];

if (process.env.NODE_ENV === "production") {
  // Production: write to files only
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: prodFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: prodFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    })
  );
} else {
  // Development: colorized console output
  transports.push(
    new winston.transports.Console({ format: devFormat })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports,
  // Prevent winston from crashing on uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      format: prodFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
      format: prodFormat,
    }),
  ],
});

// Morgan HTTP stream — pipes morgan request logs through winston
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
