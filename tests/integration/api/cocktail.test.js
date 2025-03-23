const request = require('supertest');
const app = require('../../../src/app');
const { pool } = require('../../../src/config/db');

describe('Cocktail API Tests', () => {
  let testCocktails;

  // 在所有测试开始前获取测试数据
  beforeAll(async () => {
    // 获取测试用的鸡尾酒数据
    const [cocktails] = await pool.query('SELECT * FROM cocktails LIMIT 3');
    testCocktails = cocktails;
    
    console.log('testCocktails:\n', testCocktails);
  });

  // 测试获取所有鸡尾酒接口
  describe('GET /api/cocktails', () => {
    test('应该返回所有鸡尾酒列表', async () => {
      const res = await request(app)
        .get('/api/cocktails')
        .expect('Content-Type', /json/)
        .expect(200);
      
      console.log('res.body:\n', res.body);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      
      // 验证返回的鸡尾酒数据结构
      const cocktail = res.body.data[0];
      expect(cocktail).toHaveProperty('id');
      expect(cocktail).toHaveProperty('name');
      expect(cocktail).toHaveProperty('imageUrl');
      expect(cocktail).toHaveProperty('glassType');
      expect(cocktail).toHaveProperty('instructions');
      expect(cocktail).toHaveProperty('ingredients');
      expect(Array.isArray(cocktail.ingredients)).toBe(true);
    });
  });


}); 