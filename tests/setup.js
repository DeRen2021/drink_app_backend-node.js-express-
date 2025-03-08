const { pool, testConnection } = require('../src/config/db');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// 加载测试环境配置
dotenv.config({ path: '.env.test' });

// 测试用户信息
const testUserData = {
  id: process.env.TEST_USER_ID,
  username: process.env.TEST_USER_USERNAME,
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD
};

// 生成测试 JWT 令牌
const testToken = jwt.sign(
  { id: testUserData.id, username: testUserData.username },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// 导出测试数据
global.testUserData = testUserData;
global.testToken = testToken;

// 在所有测试开始前执行
beforeAll(async () => {
  // 确保数据库连接成功
  const connected = await testConnection();
  if (!connected) {
    throw new Error('无法连接到测试数据库');
  }
  console.log('测试数据库连接成功');
});

// 在所有测试结束后执行
afterAll(async () => {
  // 关闭数据库连接
  await pool.end();
  console.log('测试数据库连接已关闭');
});

// 导出测试数据供直接导入使用
// module.exports = {
//   testUserData,
//   testToken
// };