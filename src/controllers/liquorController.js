const liquorModel = require('../models/liquor');
const logger = require('../utils/logger');
const { formatLiquors, formatLiquor } = require('../views/formatters');
const { wrapResponse } = require('../views/responseWrapper');

// 获取所有酒类
exports.getAllLiquors = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.debug(`[${requestId}] 开始获取所有酒类数据`);
    const liquors = await liquorModel.getAllLiquors();
    
    logger.info(`[${requestId}] 成功获取所有酒类，共 ${liquors.length} 条记录`);

    // format result
    const formattedLiquors = formatLiquors(liquors);
    res.status(200).json(wrapResponse(formattedLiquors));
  } catch (error) {
    logger.error(`[${requestId}] 获取所有酒类失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取单个酒类
exports.getLiquorById = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    const id = req.params.id;
    logger.debug(`[${requestId}] 开始获取ID为${id}的酒类`);
    
    const liquor = await liquorModel.getLiquorById(id);
    if (!liquor) {
      logger.warn(`[${requestId}] 未找到ID为${id}的酒类`);
      return res.status(404).json({
        success: false,
        message: `未找到ID为${id}的酒类`
      });
    }

    logger.info(`[${requestId}] 成功获取ID为${id}的酒类: ${liquor.name}`);
    const formattedLiquor = formatLiquor(liquor);
    res.status(200).json(wrapResponse(formattedLiquor));
    
  } catch (error) {
    logger.error(`[${requestId}] 获取ID为${req.params.id}的酒类失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 