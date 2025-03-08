const { pool } = require('./db');

/**
 * 创建用户表
 */
const createUsersTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.query(createTableQuery);
    console.log('用户表创建成功或已存在');
    return true;
  } catch (error) {
    console.error('创建用户表失败:', error);
    return false;
  }
};

/**
 * 创建用户酒柜关联表
 */
const createUserLiquorsTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_liquors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        liquor_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (liquor_id) REFERENCES liquors(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_liquor (user_id, liquor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.query(createTableQuery);
    console.log('用户酒柜关联表创建成功或已存在');
    return true;
  } catch (error) {
    console.error('创建用户酒柜关联表失败:', error);
    return false;
  }
};

/**
 * 运行所有迁移
 */
const runMigrations = async () => {
  try {
    console.log('开始运行数据库迁移...');
    
    // 创建用户表
    await createUsersTable();
    
    // 创建用户酒柜关联表
    await createUserLiquorsTable();
    
    console.log('所有迁移完成');
    return true;
  } catch (error) {
    console.error('迁移失败:', error);
    return false;
  }
};

// 如果直接运行此文件，则执行迁移
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('迁移脚本执行完毕');
      process.exit(0);
    })
    .catch(error => {
      console.error('迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
  createUsersTable,
  createUserLiquorsTable
}; 