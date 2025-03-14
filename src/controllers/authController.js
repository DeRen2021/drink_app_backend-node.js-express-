const User = require('../models/user');
const { generateToken } = require('../utils/auth');
const logger = require('../utils/logger');

/**
 * 用户注册控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const register = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.info(`[${requestId}] 收到用户注册请求`);
    const { username, email, password } = req.body;

    // 验证必要字段
    if (!username || !email || !password) {
      logger.warn(`[${requestId}] 注册失败：缺少必要字段`);
      return res.status(400).json({
        success: false,
        message: '请提供用户名、邮箱和密码'
      });
    }

    // 检查邮箱是否已被注册
    logger.debug(`[${requestId}] 检查邮箱是否已被注册: ${email}`);
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      logger.warn(`[${requestId}] 注册失败：邮箱已被注册 ${email}`);
      return res.status(400).json({
        success: false,
        message: '邮箱已被注册'
      });
    }

    // 检查用户名是否已被使用
    logger.debug(`[${requestId}] 检查用户名是否已被使用: ${username}`);
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      logger.warn(`[${requestId}] 注册失败：用户名已被使用 ${username}`);
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }

    // 创建新用户
    logger.debug(`[${requestId}] 开始创建新用户: ${username}`);
    const newUser = await User.create({
      username,
      email,
      password
    });

    // 生成JWT令牌
    logger.debug(`[${requestId}] 为新用户生成JWT令牌: ${newUser.id}`);
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    // 返回成功响应
    logger.info(`[${requestId}] 用户注册成功: ${newUser.username}, ID: ${newUser.id}`);
    return res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    logger.error(`[${requestId}] 用户注册失败:`, { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '注册失败，服务器内部错误'
    });
  }
};

/**
 * 用户登录控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const login = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.info(`[${requestId}] 收到用户登录请求`);
    const { email, password } = req.body;

    // 验证必要字段
    if (!email || !password) {
      logger.warn(`[${requestId}] 登录失败：缺少必要字段`);
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    // 查找用户
    logger.debug(`[${requestId}] 正在查找用户: ${email}`);
    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn(`[${requestId}] 登录失败：用户不存在 ${email}`);
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }

    // 验证密码
    logger.debug(`[${requestId}] 正在验证用户密码: ${user.id}`);
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`[${requestId}] 登录失败：密码不正确，用户ID: ${user.id}`);
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }

    // 生成JWT令牌
    logger.debug(`[${requestId}] 为用户生成JWT令牌: ${user.id}`);
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    // 构造用户对象（不包含密码）
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };

    // 返回成功响应
    logger.info(`[${requestId}] 用户登录成功: ${user.username}, ID: ${user.id}`);
    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error(`[${requestId}] 用户登录失败:`, { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '登录失败，服务器内部错误'
    });
  }
};

/**
 * 获取当前用户信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const getMe = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.debug(`[${requestId}] 获取当前用户信息: ${req.user.id}`);
    // req.user 由认证中间件设置
    
    logger.info(`[${requestId}] 已成功获取用户信息: ${req.user.username}, ID: ${req.user.id}`);
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    logger.error(`[${requestId}] 获取用户信息失败:`, { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '获取用户信息失败，服务器内部错误'
    });
  }
};

/**
 * 用户注销账户控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const deleteAccount = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.info(`[${requestId}] 收到用户注销账户请求: ${req.user.id}`);
    
    // 确认用户身份 - 这里假设req.user是由认证中间件设置的当前登录用户
    const userId = req.user.id;
    
    // 调用用户模型的deleteAccount方法执行注销
    logger.debug(`[${requestId}] 开始删除用户账户: ${userId}`);
    const isDeleted = await User.deleteAccount(userId);
    
    if (!isDeleted) {
      logger.warn(`[${requestId}] 注销账户失败，用户ID: ${userId}`);
      return res.status(400).json({
        success: false,
        message: '注销账户失败，请稍后重试'
      });
    }
    
    // 返回成功响应
    logger.info(`[${requestId}] 用户注销账户成功: ${req.user.username}, ID: ${userId}`);
    return res.status(200).json({
      success: true,
      message: '账户已成功注销'
    });
  } catch (error) {
    logger.error(`[${requestId}] 用户注销账户失败:`, { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '注销账户失败，服务器内部错误'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  deleteAccount
}; 