// utils/logger.js
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  transports: [
    new transports.Console(),

    new DailyRotateFile({
      filename: path.join(logDir, 'server-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info',
    }),

    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'error',
    })
  ]
});

module.exports = logger;
