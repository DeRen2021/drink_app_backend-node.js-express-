const request = require('supertest');
const app = require('../../../src/app'); // 确保app.js导出Express应用实例
const { pool } = require('../../../src/config/db');

describe('Liquor API Tests', () => {
  let testLiquors;
  let testLiquorTypes;

  // 在所有测试开始前获取测试数据
  beforeAll(async () => {
    // 获取测试用的酒类数据
    const [liquors] = await pool.query(`
      SELECT l.*, t.type_name 
      FROM liquors l
      LEFT JOIN ingredient_types t ON l.type_id = t.id
      LIMIT 3
    `);
    testLiquors = liquors;

    console.log('testLiquors:\n', testLiquors);

    // 获取测试用的酒类类型数据
    const [types] = await pool.query('SELECT * FROM ingredient_types LIMIT 3');
    testLiquorTypes = types;

    console.log('testLiquorTypes:\n', testLiquorTypes);
    
  });

  // 测试获取所有酒类接口
  describe('GET /api/liquors', () => {
    test('应该返回所有酒类列表', async () => {
      const res = await request(app)
        .get('/api/liquors')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('使用name参数应该返回对应名称的酒类', async () => {
      if (!testLiquors || testLiquors.length === 0) {
        console.warn('没有测试酒类数据，跳过测试');
        return;
      }

      const testLiquor = testLiquors[0];
      const res = await request(app)
        .get(`/api/liquors/name/${testLiquor.liquor_name}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(testLiquor.id);
      //expect(res.body.data.liquor_name).toBe(testLiquor.liquor_name);
    });

    test('使用不存在的name参数应该返回404错误', async () => {
      const nonExistentName = 'NonExistentLiquorName' + Date.now();
      const res = await request(app)
        .get(`/api/liquors/name/${nonExistentName}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('resource_not_found');
    });
  });

  //测试获取单个酒类接口
  describe('GET /api/liquors/:id', () => {
    test('使用有效ID应该返回对应的酒类', async () => {
      if (!testLiquors || testLiquors.length === 0) {
        console.warn('没有测试酒类数据，跳过测试');
        return;
      }

      const testLiquor = testLiquors[0];
      const res = await request(app)
        .get(`/api/liquors/${testLiquor.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      console.log('res.body:\n', res.body);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      //expect(res.body.data.id).toBe(testLiquor.id);
      expect(res.body.data.name).toBe(testLiquor.liquor_name);
    });

    test('使用不存在的ID应该返回404错误', async () => {
      const nonExistentId = 9999999; // 假设这个ID不存在
      const res = await request(app)
        .get(`/api/liquors/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('resource_not_found');
    });

    test('使用无效的ID格式应该返回400或404错误', async () => {
      const invalidId = 'invalid-id';
      const res = await request(app)
        .get(`/api/liquors/${invalidId}`)
        .expect('Content-Type', /json/);
      
      // 根据API实现，可能返回400(参数错误)或404(未找到)
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

//   // 测试获取所有酒类类型接口
//   describe('GET /api/liquors/types', () => {
//     test('应该返回所有酒类类型列表', async () => {
//       const res = await request(app)
//         .get('/api/liquors/types')
//         .expect('Content-Type', /json/)
//         .expect(200);
      
//       expect(res.body.success).toBe(true);
//       expect(Array.isArray(res.body.data)).toBe(true);
//       expect(res.body.data.length).toBeGreaterThan(0);
//     });
//   });
}); 