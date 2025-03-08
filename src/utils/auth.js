const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

/**
 * 生成JWT令牌
 * @param {Object} payload - 令牌载荷（用户信息）
 * @returns {string} - 返回生成的JWT令牌
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d' // 令牌7天有效期
  });
};

/**
 * 验证JWT令牌
 * @param {string} token - JWT令牌
 * @returns {Object|null} - 返回解码后的令牌载荷或null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * 提取请求头中的令牌
 * @param {Object} req - Express请求对象
 * @returns {string|null} - 返回提取的令牌或null
 */
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
}; 