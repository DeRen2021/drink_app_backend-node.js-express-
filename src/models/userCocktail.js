const { executeQuery } = require('../config/db');
const CocktailModel = require('./cocktail');


const UserCocktail = {
  /**
   * 获取用户可以制作的鸡尾酒
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} - 返回用户可制作的鸡尾酒数组
   */
  getUserCocktails: async (userId) => {
    const cocktails = await executeQuery(
      'Select * from user_cocktails where user_id = ?',
      [userId]
    );
    
    // 获取每个鸡尾酒的配料
    for (const cocktail of cocktails) {
      const ingredients = await executeQuery(
        `SELECT liquor_name, amount 
         FROM cocktail_ingredients 
         WHERE cocktail_id = ?`,
        [cocktail.cocktail_id]
      );
      
      cocktail.ingredients = ingredients.map(i => 
        `${i.amount} oz ${i.liquor_name}`
      );
    }
    
    return cocktails;
  },

  /**
   * 刷新用户可以制作的鸡尾酒
   * 基于用户酒柜中的酒类，更新用户可以制作的鸡尾酒列表
   * @param {number} userId - 用户ID
   * @returns {Promise<{added: number, removed: number}>} - 返回新增和移除的鸡尾酒数量
   */
  refreshUserCocktails: async (userId) => {
    try {
      // 1. 获取用户酒柜中的所有酒类ID
      const userLiquors = await executeQuery(
        `SELECT liquor_id FROM user_liquors WHERE user_id = ?`,
        [userId]
      );
      
      if (userLiquors.length === 0) {
        // 用户酒柜为空，清空用户鸡尾酒表
        await executeQuery(
          `DELETE FROM user_cocktails WHERE user_id = ?`,
          [userId]
        );
        //fix this logic,removed should not be 0 sometimes
        return { added: 0, removed: 0 };
      }
      
      const userLiquorIds = userLiquors.map(item => item.liquor_id);
      
      // 2. 获取用户当前可制作的鸡尾酒
      const availableCocktails = await CocktailModel.getAvailableCocktails(userLiquorIds);
      const availableCocktailIds = availableCocktails.map(cocktail => cocktail.id);
      
      // 3. 获取用户表中当前记录的可制作鸡尾酒
      const currentUserCocktails = await executeQuery(
        `SELECT cocktail_id FROM user_cocktails WHERE user_id = ?`,
        [userId]
      );
      const currentCocktailIds = currentUserCocktails.map(item => item.cocktail_id);
      
      // 4. 计算需要添加和删除的鸡尾酒
      const cocktailsToAdd = availableCocktailIds.filter(id => !currentCocktailIds.includes(id));
      const cocktailsToRemove = currentCocktailIds.filter(id => !availableCocktailIds.includes(id));
      
      // 5. 删除不再可用的鸡尾酒
      if (cocktailsToRemove.length > 0) {
        const removePlaceholders = cocktailsToRemove.map(() => '?').join(',');
        await executeQuery(
          `DELETE FROM user_cocktails WHERE user_id = ? AND cocktail_id IN (${removePlaceholders})`,
          [userId, ...cocktailsToRemove]
        );
      }
      
      // 6. 添加新可用的鸡尾酒
      for (const cocktailId of cocktailsToAdd) {
        await executeQuery(
          `INSERT INTO user_cocktails (user_id, cocktail_id) VALUES (?, ?)`,
          [userId, cocktailId]
        );
      }
      
      return {
        added: cocktailsToAdd.length,
        removed: cocktailsToRemove.length
      };
    } catch (error) {
      console.error('刷新用户鸡尾酒失败:', error);
      throw error;
    }
  },
  
  /**
   * 清空用户鸡尾酒表
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} - 返回是否清空成功
   */
  clearUserCocktails: async (userId) => {
    try {
      await executeQuery(
        `DELETE FROM user_cocktails WHERE user_id = ?`,
        [userId]
      );
      return true;
    } catch (error) {
      console.error('清空用户鸡尾酒失败:', error);
      return false;
    }
  }
};

module.exports = UserCocktail; 