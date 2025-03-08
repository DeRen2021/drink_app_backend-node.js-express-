const Liquor = require('../models/liquor');
const UserLiquor = require('../models/userLiquor');
const UserCocktail = require('../models/userCocktail');
const logger = require('../utils/logger');

/**
 * 获取用户酒柜中的所有酒品
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const getUserLiquors = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    
    // 获取用户酒柜中的所有酒品
    const userLiquors = await UserLiquor.getUserLiquors(userId);
    logger.info(`用户ID ${userId} 获取酒柜中的所有酒品成功，共 ${userLiquors ? userLiquors.length : 0} 条记录`);
    // 返回成功响应
    return res.status(200).json({
      success: true,
      count: userLiquors.length,
      data: userLiquors
    });
  } catch (error) {
    logger.error(`获取用户酒柜失败: ${error.message}`);
    console.error('获取用户酒柜失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取用户酒柜失败，服务器内部错误'
    });
  }
};

/**
 * 获取所有酒品并标记用户已添加的酒品
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const getAllLiquorsWithUserStatus = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    
    // 获取所有酒品
    const allLiquors = await Liquor.getAllLiquors();
    
    // 获取用户酒柜中的所有酒品ID
    const userLiquors = await UserLiquor.getUserLiquors(userId);
    const userLiquorIds = userLiquors.map(liquor => liquor.id);
    
    // 标记用户已添加的酒品
    const liquorsWithStatus = allLiquors.map(liquor => ({
      ...liquor,
      inUserCabinet: userLiquorIds.includes(liquor.id)
    }));
    logger.info(`用户ID ${userId} 获取所有酒品并标记用户已添加的酒品成功`);
    // 返回成功响应
    return res.status(200).json({
      success: true,
      count: liquorsWithStatus.length,
      data: liquorsWithStatus
    });
  } catch (error) {
    logger.error(`获取所有酒品失败: ${error.message}`);
    console.error('获取所有酒品失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取所有酒品失败，服务器内部错误'
    });
  }
};

/**
 * 添加酒品到用户酒柜
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const addLiquorToUserCabinet = async (req, res) => {
  try {
    /*
    从认证中间件获取用户ID
    {
      id: 1,
      username: 'test_user',
      email: 'dr3702@nyu.edu',
      created_at: 2025-03-05T16:14:43.000Z
    }
    */
    const userId = req.user.id;
    const requestId = req.requestId || 'unknown';
    
    logger.debug(`[${requestId}] 开始处理将酒品添加到用户酒柜的请求，用户ID: ${userId}`);
    
    /*
    从请求体获取酒品ID
    {
      liquorId: 1
    }
    */
    const { liquorId } = req.body;
    
    // 验证请求
    if (!liquorId) {
      logger.warn(`[${requestId}] 无效请求: 缺少酒品ID, 用户ID: ${userId}`);
      return res.status(400).json({
        success: false,
        message: '请提供酒品ID'
      });
    }
    
    logger.debug(`[${requestId}] 正在验证酒品ID: ${liquorId} 是否存在`);
    
    // 验证酒品是否存在
    const liquor = await Liquor.getLiquorById(liquorId);
    if (liquor.length === 0) {
      logger.warn(`[${requestId}] 未找到指定酒品，酒品ID: ${liquorId}, 用户ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: '未找到指定酒品'
      });
    }
    console.log('liquor:\n',liquor);
    logger.debug(`[${requestId}] 找到酒品: ${liquor[0].liquor_name}, 准备添加到用户酒柜`);
    
    // 添加酒品到用户酒柜
    const success = await UserLiquor.addLiquorToUserCabinet(userId, liquorId);
    
    if (!success) {
      logger.error(`[${requestId}] 数据库操作失败: 无法添加酒品到用户酒柜, 用户ID: ${userId}, 酒品ID: ${liquorId}`);
      return res.status(500).json({
        success: false,
        message: '添加酒品到用户酒柜失败'
      });
    }
    
    logger.debug(`[${requestId}] 酒品已成功添加到用户酒柜, 开始刷新用户可制作的鸡尾酒`);
    
    // 自动刷新用户可制作的鸡尾酒
    //await UserCocktail.refreshUserCocktails(userId);
    
    logger.info(`[${requestId}] 用户(ID: ${userId})成功将酒品(${liquor[0].liquor_name}, ID: ${liquorId})添加到酒柜`);
    
    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '酒品已成功添加到您的酒柜',
      data: {
        liquor: liquor[0]
      }
    });
  } catch (error) {
    const requestId = req.requestId || 'unknown';
    const userId = req.user ? req.user.id : 'unknown';
    
    logger.error(`[${requestId}] 添加酒品到用户酒柜失败, 用户ID: ${userId}`, {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    return res.status(500).json({
      success: false,
      message: '添加酒品到用户酒柜失败，服务器内部错误'
    });
  }
};

/**
 * 从用户酒柜中移除酒品
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const removeLiquorFromUserCabinet = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    
    // 从请求体获取酒品ID
    const { liquorId } = req.body;
    
    // 验证请求
    if (!liquorId) {
      logger.warn(`用户ID ${userId} 尝试移除酒品时未提供酒品ID`);
      return res.status(400).json({
        success: false,
        message: '请提供酒品ID'
      });
    }
    
    // 验证酒品是否存在
    const liquor = await Liquor.getLiquorById(liquorId);
    if (!liquor) {
      logger.warn(`用户ID ${userId} 尝试移除不存在的酒品ID ${liquorId}`);
      return res.status(404).json({
        success: false,
        message: '未找到指定酒品'
      });
    }
    
    // 从用户酒柜中移除酒品
    const success = await UserLiquor.removeLiquorFromUserCabinet(userId, liquorId);
    
    if (!success) {
      logger.warn(`用户ID ${userId} 尝试移除不在酒柜中的酒品ID ${liquorId}`);
      return res.status(404).json({
        success: false,
        message: '该酒品不在您的酒柜中'
      });
    }
    
    // 自动刷新用户可制作的鸡尾酒
    //await UserCocktail.refreshUserCocktails(userId);
    logger.info(`用户ID ${userId} 成功移除酒品ID ${liquorId} 从酒柜`);
    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '酒品已从您的酒柜中移除',
      data: {
        liquor
      }
    });
  } catch (error) {
    console.error('从用户酒柜移除酒品失败:', error);
    logger.error(`从用户酒柜移除酒品失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '从用户酒柜移除酒品失败，服务器内部错误'
    });
  }
};

/**
 * 搜索酒品并标记用户已添加的酒品
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const searchLiquorsWithUserStatus = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    
    // 从查询参数获取搜索词
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }
    
    // 由于我们没有看到Liquor模型中有search方法，这里实现一个简单的搜索逻辑
    const allLiquors = await Liquor.getAllLiquors();
    const searchResults = allLiquors.filter(liquor => 
      liquor.liquor_name.toLowerCase().includes(q.toLowerCase()) ||
      (liquor.description && liquor.description.toLowerCase().includes(q.toLowerCase()))
    );
    
    // 获取用户酒柜中的所有酒品ID
    const userLiquors = await UserLiquor.getUserLiquors(userId);
    const userLiquorIds = userLiquors.map(liquor => liquor.id);
    
    // 标记用户已添加的酒品
    const liquorsWithStatus = searchResults.map(liquor => ({
      ...liquor,
      inUserCabinet: userLiquorIds.includes(liquor.id)
    }));
    
    // 返回成功响应
    return res.status(200).json({
      success: true,
      count: liquorsWithStatus.length,
      data: liquorsWithStatus
    });
  } catch (error) {
    console.error('搜索酒品失败:', error);
    return res.status(500).json({
      success: false,
      message: '搜索酒品失败，服务器内部错误'
    });
  }
};

module.exports = {
  getUserLiquors,
  getAllLiquorsWithUserStatus,
  addLiquorToUserCabinet,
  removeLiquorFromUserCabinet,
  searchLiquorsWithUserStatus
}; 