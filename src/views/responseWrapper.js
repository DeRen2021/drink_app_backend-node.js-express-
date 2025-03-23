/**
 * 包装API响应
 * @param {Array|Object} data - 要返回的数据
 * @returns {Object} - 标准格式的响应对象
 */
const wrapResponse = (data,boolean=true) => {
    return {
      success: boolean,
      count: Array.isArray(data) ? data.length : (data ? 1 : 0),
      data: data
    };
  };
  
  module.exports = {
    wrapResponse
  };