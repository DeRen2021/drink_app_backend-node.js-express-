/**
 * 格式化单个鸡尾酒(Cocktail)数据的通用函数
 * @param {Object} cocktail - 原始鸡尾酒数据
 * @param {boolean} isUserCocktail - 是否是用户可制作的鸡尾酒
 * @returns {Object} - 格式化后的鸡尾酒对象
 */
const formatCocktail = (cocktail, isUserCocktail = false) => {
    if (!cocktail) return null;
    
    // 通用基础字段
    const formatted = {
      id: cocktail.id,
      name: cocktail.cocktail_name,
      imageUrl: cocktail.image_url || '',
      glassType: cocktail.glass_type || '',
      instructions: cocktail.instructions || '',
      ingredients: cocktail.ingredients || []
    };
    
    // 用户特有字段
    if (isUserCocktail) {
      formatted.discoveredAt = cocktail.discovered_at || null;
    }
    
    // 针对可制作状态
    if (cocktail.canMake !== undefined) {
      formatted.canMake = !!cocktail.canMake;
    }
    
    return formatted;
  };
  
  /**
   * 格式化鸡尾酒列表
   * @param {Array} cocktails - 鸡尾酒数据数组
   * @param {boolean} isUserCocktails - 是否是用户可制作的鸡尾酒
   * @returns {Array} - 格式化后的鸡尾酒数组
   */
  const formatCocktails = (cocktails, isUserCocktails = false) => {
    if (!cocktails || !Array.isArray(cocktails)) return [];
    return cocktails.map(cocktail => formatCocktail(cocktail, isUserCocktails));
  };
  
  module.exports = {
    formatCocktail,
    formatCocktails
  };