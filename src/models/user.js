const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * 用户模型
 */
const User = {
  /**
   * 根据邮箱查找用户
   * @param {string} email - 用户邮箱
   * @returns {Promise<Object|null>} - 返回用户对象或null
   */
  findByEmail: async (email) => {
    const rows = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    // 添加健壮性检查
    if (!rows || !Array.isArray(rows)) {
      console.log('查询结果异常:', rows);
      return null;
    }
    
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {Promise<Object|null>} - 返回用户对象或null
   */
  findByUsername: async (username) => {
    const rows = await executeQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    // 添加健壮性检查
    if (!rows || !Array.isArray(rows)) {
      console.log('查询结果异常:', rows);
      return null;
    }
    
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * 根据ID查找用户
   * @param {number} id - 用户ID
   * @returns {Promise<Object|null>} - 返回用户对象或null
   */
  findById: async (id) => {
    const rows = await executeQuery(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
    
    // 添加健壮性检查
    if (!rows || !Array.isArray(rows)) {
      console.log('查询结果异常:', rows);
      return null;
    }
    
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise<Object>} - 返回创建的用户（不含密码）
   */
  create: async ({ username, email, password }) => {
    // 对密码进行哈希处理
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await executeQuery(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    if (!result || !result.insertId) {
      console.log('插入用户数据异常:', result);
      throw new Error('创建用户失败');
    }

    const rows = await executeQuery(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    // 添加健壮性检查
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      console.log('获取新创建用户数据异常:', rows);
      throw new Error('无法获取新创建的用户数据');
    }

    return rows[0];
  },

  /**
   * 验证用户密码
   * @param {string} plainPassword - 明文密码
   * @param {string} hashedPassword - 哈希后的密码
   * @returns {Promise<boolean>} - 返回密码是否匹配
   */
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * 注销（删除）用户账户
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} - 返回是否成功删除账户
   */
  deleteAccount: async (userId) => {
    try {
      const result = await executeQuery(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      
      // 检查删除操作是否成功
      if (!result || result.affectedRows === 0) {
        console.log('删除用户数据失败:', result);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('注销账户时发生错误:', error);
      return false;
    }
  }

};

module.exports = User; 