const { verifyToken, extractToken } = require('../utils/auth');
const User = require('../models/user');

/**
 * 认证中间件，验证用户是否已登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 * @returns {void}
 */
const authenticate = async (req, res, next) => {
  try {
    // 从请求头中提取令牌
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，访问被拒绝'
      });
    }

    // 验证令牌
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌，访问被拒绝'
      });
    }

    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在，访问被拒绝'
      });
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    
    // 继续下一个中间件
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  authenticate
}; 