const { pool, executeQuery } = require('../config/db');

class LiquorModel {
  async getAllLiquors() {
    try {
      const rows = await executeQuery('SELECT * FROM liquors');
      return rows;
    } catch (error) {
      console.error('获取酒类列表失败:', error);
      throw error;
    }
  }

  // 根据ID获取酒类
  async getLiquorById(id) {
    try {
      const rows = await executeQuery('SELECT * FROM liquors WHERE id = ?', [id]);
      return rows;
    } catch (error) {
      console.error(`获取酒类ID=${id}失败:`, error);
      throw error;
    }
  }
}

module.exports = new LiquorModel(); 