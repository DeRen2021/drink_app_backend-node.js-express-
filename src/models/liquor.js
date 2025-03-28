const { pool, executeQuery } = require('../config/db');

class LiquorModel {
  /**
   * 获取所有酒类
   * @returns {Array} - 酒类数组
   */
  async getAllLiquors() {
    try {
      const rows = await executeQuery(`
        SELECT l.*, t.type_name 
        FROM liquors l
        LEFT JOIN ingredient_types t ON l.type_id = t.id
        ORDER BY l.liquor_name
      `);
      return rows;
    } catch (error) {
      console.error('获取酒类列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取酒类
   * @param {Number} id - 酒类ID
   * @returns {Object|null} - 酒类对象或null
   */
  async getLiquorById(id) {
    try {
      const rows = await executeQuery(`
        SELECT l.*, t.type_name 
        FROM liquors l
        LEFT JOIN ingredient_types t ON l.type_id = t.id
        WHERE l.id = ?
      `, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`获取酒类ID=${id}失败:`, error);
      throw error;
    }
  }

  /**
   * 根据名称精确获取酒类
   * @param {String} name - 酒类名称
   * @returns {Object|null} - 酒类对象或null
   */
  async getLiquorByName(name) {
    try {
      const rows = await executeQuery(`
        SELECT l.*, t.type_name 
        FROM liquors l
        LEFT JOIN ingredient_types t ON l.type_id = t.id
        WHERE l.liquor_name = ?
        LIMIT 1
      `, [name]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`根据名称获取酒类失败: ${name}`, error);
      throw error;
    }
  }

  /**
   * 根据类型ID获取酒类
   * @param {Number} typeId - 类型ID
   * @returns {Array} - 酒类数组
   */
  async getLiquorsByTypeId(typeId) {
    try {
      const rows = await executeQuery(`
        SELECT l.*, t.type_name 
        FROM liquors l
        LEFT JOIN ingredient_types t ON l.type_id = t.id
        WHERE l.type_id = ?
        ORDER BY l.liquor_name
      `, [typeId]);
      return rows;
    } catch (error) {
      console.error(`获取类型ID=${typeId}的酒类失败:`, error);
      throw error;
    }
  }

  /**
   * 获取所有酒类类型
   * @returns {Array} - 类型数组
   */
  async getAllLiquorTypes() {
    try {
      const rows = await executeQuery('SELECT * FROM ingredient_types ORDER BY type_name');
      return rows;
    } catch (error) {
      console.error('获取酒类类型列表失败:', error);
      throw error;
    }
  }
}

module.exports = new LiquorModel(); 