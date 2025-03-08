const { pool, executeQuery } = require('../config/db');

class CocktailModel {
  // 获取所有鸡尾酒
  async getAllCocktails() {
    try {
      // 基本查询：获取所有鸡尾酒记录
      const cocktails = await executeQuery('SELECT * FROM cocktails');
      console.log(cocktails);
      // 为每个鸡尾酒获取配料信息
      for (const cocktail of cocktails) {
        const ingredients = await executeQuery(
          'SELECT liquor_name, amount, unit FROM cocktail_ingredients WHERE cocktail_id = ?',
          [cocktail.id]
        );
        
        // 格式化配料列表
        cocktail.ingredients = ingredients.map(i => 
          `${i.amount} ${i.unit} ${i.liquor_name}`
        );
      }
      
      return cocktails;
    } catch (error) {
      console.error('获取鸡尾酒列表失败:', error);
      throw error;
    }
  }

  // 获取用户可制作的鸡尾酒
  async getAvailableCocktails(liquorIds) {
    try {
      // 1. 获取所有鸡尾酒ID和它们需要的配料
      const cocktailIngredients = await executeQuery(`
        SELECT DISTINCT c.id, c.cocktail_name, ci.liquor_name 
        FROM cocktails c
        JOIN cocktail_ingredients ci ON c.id = ci.cocktail_id
      `);

      // 2. 获取用户拥有的酒类名称
      const placeholders = liquorIds.map(() => '?').join(',');
      const userLiquors = await executeQuery(`
        SELECT id, liquor_name FROM liquors WHERE id IN (${placeholders})
      `, liquorIds);

      // 用户拥有的酒类名称集合
      const userLiquorNames = new Set(userLiquors.map(l => l.liquor_name));

      // 3. 根据配料分组鸡尾酒
      const cocktailMap = new Map();
      cocktailIngredients.forEach(row => {
        if (!cocktailMap.has(row.id)) {
          cocktailMap.set(row.id, {
            id: row.id,
            name: row.cocktail_name,
            requiredLiquors: new Set()
          });
        }
        cocktailMap.get(row.id).requiredLiquors.add(row.liquor_name);
      });

      // 4. 筛选用户可以制作的鸡尾酒
      const availableCocktailIds = [];
      for (const [id, cocktail] of cocktailMap.entries()) {
        const canMake = Array.from(cocktail.requiredLiquors).every(liquor => 
          userLiquorNames.has(liquor)
        );
        
        if (canMake) {
          availableCocktailIds.push(id);
        }
      }

      // 5. 如果没有可用鸡尾酒，返回空数组
      if (availableCocktailIds.length === 0) {
        return [];
      }

      // 6. 获取可用鸡尾酒的完整信息
      const idPlaceholders = availableCocktailIds.map(() => '?').join(',');
      const availableCocktails = await executeQuery(`
        SELECT * FROM cocktails WHERE id IN (${idPlaceholders})
      `, availableCocktailIds);

      // 7. 获取每个鸡尾酒的配料详情
      for (const cocktail of availableCocktails) {
        const ingredients = await executeQuery(`
          SELECT liquor_name, amount, unit 
          FROM cocktail_ingredients 
          WHERE cocktail_id = ?
        `, [cocktail.id]);
        
        cocktail.ingredients = ingredients.map(i => 
          `${i.amount} ${i.unit} ${i.liquor_name}`
        );
      }

      return availableCocktails;
    } catch (error) {
      console.error('获取可用鸡尾酒失败:', error);
      throw error;
    }
  }
}

module.exports = new CocktailModel();