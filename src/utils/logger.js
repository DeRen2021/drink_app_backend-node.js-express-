const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
const { combine, timestamp, printf, colorize } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

/*
Add create folder logs if not exists
Add different colors to the console output
Maybe add remove old logs


*/

// 创建logs文件夹（如果不存在）
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 自定义日志格式
const logFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// 自定义控制台格式（带颜色）
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

// 文件日志格式（无颜色）
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

// 创建logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    // 控制台输出（带颜色）
    new transports.Console({ 
      format: consoleFormat 
    }),
    
    // 错误日志（每日轮换）
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '7d',  // 保留7天的日志
      format: fileFormat
    }),
    
    // 所有日志（每日轮换）
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',  // 保留7天的日志
      format: fileFormat
    })
  ]
});

module.exports = logger;