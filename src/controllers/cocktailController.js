const cocktailModel = require('../models/cocktail');
const logger = require('../utils/logger');
const {formatCocktails, formatCocktail} = require('../views/formatters');
const { wrapResponse } = require('../views/responseWrapper');


exports.getAllCocktails = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.debug(`[${requestId}] 正在获取所有鸡尾酒数据`);
    const cocktails = await cocktailModel.getAllCocktails();
    
    logger.info(`[${requestId}] 获取所有鸡尾酒成功，共 ${cocktails.length} 条记录`);

    // format result
    const fromatCT = formatCocktails(cocktails)
    res.status(200).json(wrapResponse(fromatCT));

  } catch (error) {
    logger.error(`[${requestId}] 获取所有鸡尾酒失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户可制作的鸡尾酒
exports.getAvailableCocktails = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.debug(`[${requestId}] 正在获取用户可制作的鸡尾酒`);
    // 从请求体中获取用户拥有的酒类ID
    const { liquorIds } = req.body;
    
    // 验证请求
    if (!liquorIds || !Array.isArray(liquorIds) || liquorIds.length === 0) {
      logger.warn(`[${requestId}] 获取可用鸡尾酒失败：无效的酒类ID数组`);
      return res.status(400).json({
        success: false,
        message: '请提供有效的酒类ID数组'
      });
    }

    logger.debug(`[${requestId}] 用户提供了 ${liquorIds.length} 个酒类ID，正在查询可制作的鸡尾酒`);
    // 获取可用鸡尾酒
    const availableCocktails = await cocktailModel.getAvailableCocktails(liquorIds);

    // format result
    const fromatACT = formatCocktails(availableCocktails)

    logger.info(`[${requestId}] 成功获取用户可制作的鸡尾酒，共 ${availableCocktails.length} 款`);
    res.status(200).json(wrapResponse(fromatACT));
  } catch (error) {
    logger.error(`[${requestId}] 获取用户可制作的鸡尾酒失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};