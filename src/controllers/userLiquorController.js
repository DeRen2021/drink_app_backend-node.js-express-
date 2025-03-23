const Liquor = require('../models/liquor');
const UserLiquor = require('../models/userLiquor');
const logger = require('../utils/logger');
const { formatLiquors } = require('../views/formatters');
const { wrapResponse } = require('../views/responseWrapper');

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
    
    // 格式化结果
    const formattedUserLiquors = formatLiquors(userLiquors);
    
    // 返回成功响应
    return res.status(200).json(wrapResponse(formattedUserLiquors));
    
  } catch (error) {
    logger.error(`获取用户酒柜失败: ${error.message}`);
    return res.status(500).json(wrapResponse(null, false, '获取用户酒柜失败，服务器内部错误'));
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
    return res.status(200).json(wrapResponse({
      count: liquorsWithStatus.length,
      items: liquorsWithStatus
    }));
  } catch (error) {
    logger.error(`获取所有酒品失败: ${error.message}`);
    return res.status(500).json(wrapResponse(null, false, '获取所有酒品失败，服务器内部错误'));
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
    const userId = req.user.id;
    const requestId = req.requestId || 'unknown';
    
    logger.debug(`[${requestId}] 开始处理将酒品添加到用户酒柜的请求，用户ID: ${userId}`);
    
    // 从请求体获取酒品ID
    const { liquorId } = req.body;
    
    // 验证请求
    if (!liquorId) {
      logger.warn(`[${requestId}] 无效请求: 缺少酒品ID, 用户ID: ${userId}`);
      return res.status(400).json(wrapResponse(null, false, '请提供酒品ID'));
    }
    
    logger.debug(`[${requestId}] 正在验证酒品ID: ${liquorId} 是否存在`);
    
    // 验证酒品是否存在
    const liquor = await Liquor.getLiquorById(liquorId);
    if (liquor == null) {
      logger.warn(`[${requestId}] 未找到指定酒品，酒品ID: ${liquorId}, 用户ID: ${userId}`);
      return res.status(404).json(wrapResponse(null, false, '未找到指定酒品'));
    }
    console.log('debug3',liquor)
    
    logger.debug(`[${requestId}] 找到酒品: ${liquor.liquor_name}, 准备添加到用户酒柜`);
    
    // 添加酒品到用户酒柜
    const success = await UserLiquor.addLiquorToUserCabinet(userId, liquorId);
    
    if (!success) {
      logger.error(`[${requestId}] 数据库操作失败: 无法添加酒品到用户酒柜, 用户ID: ${userId}, 酒品ID: ${liquorId}`);
      return res.status(500).json(wrapResponse(null, false, '添加酒品到用户酒柜失败'));
    }
    
    logger.debug(`[${requestId}] 酒品已成功添加到用户酒柜, 开始刷新用户可制作的鸡尾酒`);
    
    // 自动刷新用户可制作的鸡尾酒
    //await UserCocktail.refreshUserCocktails(userId);
    
    logger.info(`[${requestId}] 用户(ID: ${userId})成功将酒品(${liquor.liquor_name}, ID: ${liquorId})添加到酒柜`);
    
    // 返回成功响应 - 使用201状态码表示资源创建成功
    return res.status(201).json(wrapResponse({
      liquor: liquor
    }, true, '酒品已成功添加到您的酒柜'));
  } catch (error) {
    const requestId = req.requestId || 'unknown';
    const userId = req.user ? req.user.id : 'unknown';
    
    // console.log('debug2',error.message,error.stack)
    logger.error(`[${requestId}] 添加酒品到用户酒柜失败, 用户ID: ${userId}`, {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    return res.status(500).json(wrapResponse(null, false, '添加酒品到用户酒柜失败，服务器内部错误'));
  }
};

/**
 * 根据酒名添加酒品到用户酒柜
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} - 返回响应对象
 */
const addLiquorToUserCabinetByName = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    const requestId = req.requestId || 'unknown';
    
    logger.debug(`[${requestId}] 开始处理根据酒名将酒品添加到用户酒柜的请求，用户ID: ${userId}`);
    
    // 从请求体获取酒品名称
    const { liquorName } = req.body;
    
    // 验证请求
    if (!liquorName) {
      logger.warn(`[${requestId}] 无效请求: 缺少酒品名称, 用户ID: ${userId}`);
      return res.status(400).json(wrapResponse(null, false, '请提供酒品名称'));
    }
    
    logger.debug(`[${requestId}] 正在根据名称"${liquorName}"查询酒品`);
    
    // 根据名称查找酒品
    const liquor = await Liquor.getLiquorByName(liquorName);
    if (!liquor) {
      logger.warn(`[${requestId}] 未找到指定名称的酒品: ${liquorName}, 用户ID: ${userId}`);
      return res.status(404).json(wrapResponse(null, false, `未找到名称为"${liquorName}"的酒品`));
    }
    
    logger.debug(`[${requestId}] 找到酒品: ${liquor.liquor_name}, ID: ${liquor.id}, 准备添加到用户酒柜`);
    
    // 添加酒品到用户酒柜
    const success = await UserLiquor.addLiquorToUserCabinet(userId, liquor.id);
    
    if (!success) {
      logger.error(`[${requestId}] 数据库操作失败: 无法添加酒品到用户酒柜, 用户ID: ${userId}, 酒品ID: ${liquor.id}`);
      return res.status(500).json(wrapResponse(null, false, '添加酒品到用户酒柜失败'));
    }
    
    logger.info(`[${requestId}] 用户(ID: ${userId})成功将酒品(${liquor.liquor_name}, ID: ${liquor.id})添加到酒柜`);
    
    // 返回成功响应 - 使用201状态码表示资源创建成功
    return res.status(201).json(wrapResponse({
      liquor: liquor
    }, true, '酒品已成功添加到您的酒柜'));
  } catch (error) {
    const requestId = req.requestId || 'unknown';
    const userId = req.user ? req.user.id : 'unknown';
    
    logger.error(`[${requestId}] 根据酒名添加酒品到用户酒柜失败, 用户ID: ${userId}`, {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    return res.status(500).json(wrapResponse(null, false, '添加酒品到用户酒柜失败，服务器内部错误'));
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
const userId = req.user.id;
    const requestId = req.requestId || 'unknown';
    
    // 从URL参数获取酒品ID
    const liquorId = req.params.liquorId;
    
    logger.debug(`[${requestId}] 开始处理将酒品从用户酒柜移除的请求，用户ID: ${userId}, 酒品ID: ${liquorId}`);
    
    // 验证请求
    if (!liquorId) {
      logger.warn(`[${requestId}] 无效请求: 缺少酒品ID, 用户ID: ${userId}`);
      return res.status(400).json(wrapResponse(null, false, '请提供酒品ID'));
    }
    
    // 验证酒品是否存在
    const liquor = await Liquor.getLiquorById(liquorId);
    if (liquor.length === 0) {
      logger.warn(`[${requestId}] 未找到指定酒品，酒品ID: ${liquorId}, 用户ID: ${userId}`);
      return res.status(404).json(wrapResponse(null, false, '未找到指定酒品'));
    }
    
    // 从用户酒柜中移除酒品
    const success = await UserLiquor.removeLiquorFromUserCabinet(userId, liquorId);
    
    if (!success) {
      logger.warn(`[${requestId}] 用户ID ${userId} 尝试移除不在酒柜中的酒品ID ${liquorId}`);
      return res.status(404).json(wrapResponse(null, false, '该酒品不在您的酒柜中'));
    }
    
    // 自动刷新用户可制作的鸡尾酒
    //await UserCocktail.refreshUserCocktails(userId);
    
    logger.info(`[${requestId}] 用户ID ${userId} 成功从酒柜中移除酒品ID ${liquorId}`);
    
    // 按照RESTful标准，DELETE操作成功后返回204 No Content
    return res.status(204).send();
  } catch (error) {
    const requestId = req.requestId || 'unknown';
    const userId = req.user ? req.user.id : 'unknown';
    
    logger.error(`[${requestId}] 从用户酒柜移除酒品失败, 用户ID: ${userId}`, {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    return res.status(500).json(wrapResponse(null, false, '从用户酒柜移除酒品失败，服务器内部错误'));
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
    const requestId = req.requestId || 'unknown';
    
    // 从查询参数获取搜索词
    const { q } = req.query;
    
    logger.debug(`[${requestId}] 开始处理搜索酒品请求，用户ID: ${userId}, 关键词: ${q}`);
    
    if (!q) {
      logger.warn(`[${requestId}] 无效请求: 缺少搜索关键词, 用户ID: ${userId}`);
      return res.status(400).json(wrapResponse(null, false, '请提供搜索关键词'));
    }
    
    // 搜索酒品
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
    
    logger.info(`[${requestId}] 用户ID ${userId} 搜索酒品成功，关键词: ${q}, 找到 ${liquorsWithStatus.length} 条结果`);
    
    // 返回成功响应
    return res.status(200).json(wrapResponse({
      count: liquorsWithStatus.length,
      items: liquorsWithStatus
    }));
  } catch (error) {
    const requestId = req.requestId || 'unknown';
    const userId = req.user ? req.user.id : 'unknown';
    
    logger.error(`[${requestId}] 搜索酒品失败, 用户ID: ${userId}`, {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    return res.status(500).json(wrapResponse(null, false, '搜索酒品失败，服务器内部错误'));
  }
};

module.exports = {
  getUserLiquors,
  getAllLiquorsWithUserStatus,
  addLiquorToUserCabinet,
  addLiquorToUserCabinetByName,
  removeLiquorFromUserCabinet,
  searchLiquorsWithUserStatus
}; 