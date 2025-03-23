const liquorModel = require('../models/liquor');
const logger = require('../utils/logger');
const { formatLiquors, formatLiquor } = require('../views/formatters');
const { wrapResponse } = require('../views/responseWrapper');

/**
 * 获取所有酒类
 * GET /api/liquors
 */
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
      error: {
        code: 'internal_server_error',
        message: '服务器错误'
      }
    });
  }
};

/**
 * 获取单个酒类
 * GET /api/liquors/:id
 */
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
        error: {
          code: 'resource_not_found',
          message: `未找到ID为${id}的酒类`
        }
      });
    }

    logger.info(`[${requestId}] 成功获取ID为${id}的酒类: ${liquor.liquor_name}`);
    const formattedLiquor = formatLiquor(liquor);
    res.status(200).json(wrapResponse(formattedLiquor));
    
  } catch (error) {
    logger.error(`[${requestId}] 获取ID为${req.params.id}的酒类失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'internal_server_error',
        message: '服务器错误'
      }
    });
  }
};

/**
 * 根据名称精确获取酒类
 * GET /api/liquors/name/:name
 */
exports.getLiquorByName = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    const name = req.params.name;
    
    logger.debug(`[${requestId}] 开始根据名称"${name}"精确查询酒类`);
    
    const liquor = await liquorModel.getLiquorByName(name);
    
    if (!liquor) {
      logger.warn(`[${requestId}] 未找到名称为"${name}"的酒类`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'resource_not_found',
          message: `未找到名称为"${name}"的酒类`
        }
      });
    }
    
    logger.info(`[${requestId}] 成功根据名称"${name}"找到酒类: ID=${liquor.id}`);
    const formattedLiquor = formatLiquor(liquor);
    res.status(200).json(wrapResponse(formattedLiquor));
    
  } catch (error) {
    logger.error(`[${requestId}] 根据名称"${req.params.name}"查询酒类失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'internal_server_error',
        message: '服务器错误'
      }
    });
  }
};

/**
 * 获取所有酒类类型
 * GET /api/liquors/types
 */
exports.getLiquorTypes = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  try {
    logger.debug(`[${requestId}] 开始获取所有酒类类型`);
    
    const types = await liquorModel.getAllLiquorTypes();
    
    logger.info(`[${requestId}] 成功获取所有酒类类型，共 ${types.length} 种类型`);
    res.status(200).json(wrapResponse(types));
    
  } catch (error) {
    logger.error(`[${requestId}] 获取所有酒类类型失败: ${error.message}`, {
      error: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'internal_server_error',
        message: '服务器错误'
      }
    });
  }
};



