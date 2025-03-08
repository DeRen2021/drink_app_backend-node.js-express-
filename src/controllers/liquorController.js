const liquorModel = require('../models/liquor');
const logger = require('../utils/logger');

// 获取所有酒类
exports.getAllLiquors = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.debug(`[${requestId}] 开始获取所有酒类数据`);
    const liquors = await liquorModel.getAllLiquors();
    
    logger.info(`[${requestId}] 成功获取所有酒类，共 ${liquors.length} 条记录`);
    res.status(200).json({
      success: true,
      count: liquors.length,
      data: liquors
    });
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
    res.status(200).json({
      success: true,
      data: liquor
    });
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