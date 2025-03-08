const UserCocktail = require('../models/userCocktail');
const logger = require('../utils/logger');

/**
 * 获取用户可以制作的鸡尾酒
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const getUserCocktails = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    
    logger.debug(`[${requestId}] 开始获取用户(ID: ${userId})可制作的鸡尾酒`);
    
    // 获取用户可以制作的鸡尾酒
    const userCocktails = await UserCocktail.getUserCocktails(userId);
    
    logger.info(`[${requestId}] 成功获取用户(ID: ${userId})可制作的鸡尾酒，共 ${userCocktails.length} 款`);
    
    // 返回成功响应
    return res.status(200).json({
      success: true,
      count: userCocktails.length,
      data: userCocktails
    });
  } catch (error) {
    logger.error(`[${requestId}] 获取用户鸡尾酒失败，用户ID: ${req.user.id}`, {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: '获取用户鸡尾酒失败，服务器内部错误'
    });
  }
};

/**
 * 手动刷新用户可以制作的鸡尾酒
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const refreshUserCocktails = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    
    logger.debug(`[${requestId}] 开始刷新用户(ID: ${userId})可制作的鸡尾酒`);
    
    // 刷新用户可以制作的鸡尾酒
    const result = await UserCocktail.refreshUserCocktails(userId);
    
    logger.info(`[${requestId}] 成功刷新用户(ID: ${userId})的鸡尾酒列表，新增 ${result.added} 款，移除 ${result.removed} 款`);
    
    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: `鸡尾酒列表已刷新：新增${result.added}个，移除${result.removed}个`,
      data: result
    });
  } catch (error) {
    logger.error(`[${requestId}] 刷新用户鸡尾酒失败，用户ID: ${req.user.id}`, {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: '刷新用户鸡尾酒失败，服务器内部错误'
    });
  }
};

module.exports = {
  getUserCocktails,
  refreshUserCocktails
}; 