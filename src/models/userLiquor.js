const { executeQuery } = require('../config/db');

/**
 * 用户酒柜模型
 */
const UserLiquor = {
  /**
   * 获取用户酒柜中所有酒品
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} - 返回酒品数组
   */
  getUserLiquors: async (userId) => {
    const rows = await executeQuery(
      `SELECT l.*, ul.added_at 
       FROM liquors l
       JOIN user_liquors ul ON l.id = ul.liquor_id
       WHERE ul.user_id = ?
       ORDER BY l.liquor_name ASC`,
      [userId]
    );
    return rows;
  },

  /**
   * 添加酒品到用户酒柜
   * @param {number} userId - 用户ID
   * @param {number} liquorId - 酒品ID
   * @returns {Promise<boolean>} - 返回是否添加成功
   */
  addLiquorToUserCabinet: async (userId, liquorId) => {
    try {
      // 检查关联是否已存在
      const existingRows = await executeQuery(
        'SELECT id FROM user_liquors WHERE user_id = ? AND liquor_id = ?',
        [userId, liquorId]
      );

      if (existingRows.length > 0) {
        // 已经存在，不需要重复添加
        return true;
      }

      // 添加新关联
      await executeQuery(
        'INSERT INTO user_liquors (user_id, liquor_id) VALUES (?, ?)',
        [userId, liquorId]
      );
      return true;
    } catch (error) {
      console.error('添加酒品到用户酒柜失败:', error);
      return false;
    }
  },

  /**
   * 从用户酒柜中移除酒品
   * @param {number} userId - 用户ID
   * @param {number} liquorId - 酒品ID
   * @returns {Promise<boolean>} - 返回是否移除成功
   */
  removeLiquorFromUserCabinet: async (userId, liquorId) => {
    try {
      const result = await executeQuery(
        'DELETE FROM user_liquors WHERE user_id = ? AND liquor_id = ?',
        [userId, liquorId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('从用户酒柜移除酒品失败:', error);
      return false;
    }
  },

  /**
   * 检查酒品是否在用户酒柜中
   * @param {number} userId - 用户ID
   * @param {number} liquorId - 酒品ID
   * @returns {Promise<boolean>} - 返回酒品是否在用户酒柜中
   */
  isLiquorInUserCabinet: async (userId, liquorId) => {
    const rows = await executeQuery(
      'SELECT id FROM user_liquors WHERE user_id = ? AND liquor_id = ?',
      [userId, liquorId]
    );
    console.log('row.length动画化的我iu啊护卫队啊', rows.length);
    return rows.length > 0;
  }
};

module.exports = UserLiquor; 