/**
 * 格式化单个酒品(Liquor)数据的通用函数
 * @param {Object} liquor - 原始酒品数据
 * @param {boolean} isUserLiquor - 是否是用户酒柜中的酒品
 * @returns {Object} - 格式化后的酒品对象
 */
const formatLiquor = (liquor, isUserLiquor = false) => {
  if (!liquor) return null;
  
  // 通用基础字段
  const formatted = {
    id: liquor.id,
    name: liquor.liquor_name,
    //category: liquor.category || '',
    imageUrl: liquor.image_url || '',
    type: liquor.type_name || '',
  };
  
  // 用户特有字段
  if (isUserLiquor) {
    formatted.addedAt = liquor.added_at || null;
  }
  
  // 针对混合场景（如getAllLiquorsWithUserStatus）
  if (liquor.inUserCabinet !== undefined) {
    formatted.inUserCabinet = !!liquor.inUserCabinet;
  }
  
  return formatted;
};

/**
 * 格式化酒品列表
 * @param {Array} liquors - 酒品数据数组
 * @param {boolean} isUserLiquors - 是否是用户酒柜中的酒品
 * @returns {Array} - 格式化后的酒品数组
 */
const formatLiquors = (liquors, isUserLiquors = false) => {
  if (!liquors || !Array.isArray(liquors)) return [];
  return liquors.map(liquor => formatLiquor(liquor, isUserLiquors));
};

module.exports = {
  formatLiquor,
  formatLiquors
};