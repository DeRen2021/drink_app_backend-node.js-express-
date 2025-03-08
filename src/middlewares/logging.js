const logger = require('../utils/logger');

/**
 * HTTP请求日志中间件
 * 记录所有进入应用的HTTP请求和响应
 */
const requestLogger = (req, res, next) => {
  // 生成请求ID
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // 记录请求开始信息
  const startTime = new Date();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // 将请求ID附加到请求对象以便在控制器中使用
  req.requestId = requestId;
  
  // 创建记录请求信息
  const requestLog = {
    requestId,
    method,
    url,
    ip,
    userAgent: req.headers['user-agent'],
    body: method !== 'GET' ? JSON.stringify(req.body) : '',
    query: Object.keys(req.query).length ? JSON.stringify(req.query) : '',
    userId: req.user ? req.user.id : 'unauthenticated',
  };
  
  // 记录请求信息
  logger.info(`收到请求: ${JSON.stringify(requestLog)}`);
  
  // 捕获响应完成事件
  res.on('finish', () => {
    // 计算处理时间
    const duration = new Date() - startTime;
    const statusCode = res.statusCode;
    
    // 记录响应信息
    const responseLog = {
      requestId,
      statusCode,
      duration: `${duration}ms`
    };
    
    // 根据状态码选择日志级别
    if (statusCode >= 500) {
      logger.error(`请求响应: ${JSON.stringify(responseLog)}`);
    } else if (statusCode >= 400) {
      logger.warn(`请求响应: ${JSON.stringify(responseLog)}`);
    } else {
      logger.info(`请求响应: ${JSON.stringify(responseLog)}`);
    }
  });
  
  next();
};

/**
 * 错误日志中间件
 * 记录应用中发生的所有错误
 */
const errorLogger = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // 记录错误信息
  logger.error(`处理请求 ${requestId} 时发生错误: ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    }
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
}; 