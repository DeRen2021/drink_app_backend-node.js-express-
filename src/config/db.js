const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('../utils/logger');

const default_retry_times = 3;

const getBackoffTime = (attempt) => {
  const base = Math.pow(2, attempt) * 100; // 指数增长
  return base + Math.random() * 100; // 添加随机抖动
};

const isSafeToRetry = (query) => {
  return query.trim().toUpperCase().startsWith("SELECT");
};

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 30,
  // 增加连接稳定性的配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10秒
  connectTimeout: 20000, // 连接超时时间20秒
  //acquireTimeout: 30000, // 获取连接超时时间30秒
  // 添加重试策略
  maxIdle: 10, // 最大空闲连接数
  idleTimeout: 60000, // 连接空闲超时时间60秒
});

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    logger.error(`数据库连接失败: ${error.message}`, {
      error: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
    });
    return false;
  }
};

// 执行SQL查询
const executeQuery = async (query, params = [], retries = default_retry_times) => {
  let lastError = null;

  if (!isSafeToRetry(query)) {
    retries = 1;
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.debug(`执行SQL查询 (尝试 ${attempt}/${retries}): ${query}`, {
        params: JSON.stringify(params)
      });
      
      const [rows, fields] = await pool.execute(query, params);
      
      if (query.startsWith('SELECT')) {
        logger.debug(`SQL查询成功，返回 ${rows.length} 行数据`);
      }
      
      // 使用JSON.stringify来格式化输出对象
      logger.debug('查询结果:', {
        rows: JSON.stringify(rows, null, 2),
        fields: JSON.stringify(fields, null, 2)
      });

      return rows;

    } catch (error) {
      lastError = error;
      
      // 截断查询字符串，避免日志过长
      const truncatedQuery = query.length > 200 ? query.substring(0, 200) + '...' : query;
      
      logger.warn(`SQL查询失败 (尝试 ${attempt}/${retries}): ${error.message}`, {
        error: {
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        },
        query: truncatedQuery,
        params: JSON.stringify(params)
      });
      
      // 如果还有重试次数，等待并重试
      if (attempt < retries) {
        const delay = getBackoffTime(attempt);
        logger.debug(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } 
  
  // 所有重试都失败
  const truncatedQuery = query.length > 200 ? query.substring(0, 200) + '...' : query;
  logger.error(`SQL查询最终失败 (${retries}次尝试后): ${lastError.message}`, {
    error: {
      code: lastError.code,
      errno: lastError.errno,
      sqlState: lastError.sqlState,
      sqlMessage: lastError.sqlMessage
    },
    query: truncatedQuery,
    params: JSON.stringify(params)
  });
  
  throw lastError;
};

module.exports = {
  pool,
  testConnection,
  executeQuery
}; 