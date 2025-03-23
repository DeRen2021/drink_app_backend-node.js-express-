const request = require('supertest');
const app = require('../../../src/app'); // 确保app.js导出Express应用实例
const { pool } = require('../../../src/config/db');
const jwt = require('jsonwebtoken');


describe('userLiquor API test', () => {
    let testUserId = global.testUserData.id;
    let testToken = global.testToken;
    let testLiquorId = [70,'brandy']
    let testLiquorId2 = [71,'campari']

    beforeAll(async () => {
        // delete all user liquor records for the test user
        await pool.query('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);

    });
    afterAll(async () => {
        await pool.execute('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);
      });

    describe('GET /api/user-liquors/cabinet', () => {

        test('test request without token,should return 401', async () => {
          const res = await request(app)
            .get('/api/user-liquors/cabinet')
            .expect('Content-Type', /json/)
            .expect(401);
            
          expect(res.body.success).toBe(false);
        });

        test('test request with token with 0 liquor in cabinet', async () => {
            
            const res = await request(app)
              .get('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .expect('Content-Type', /json/)
              .expect(200);

            console.log('res.body:\n',res.body);
              
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(0);
          });



        test('test request with token with 1 liquor in cabinet', async () => {
            await pool.execute(
              'INSERT INTO user_liquors (user_id, liquor_id) VALUES (?, ?)',
              [testUserId, testLiquorId[0]]
            );
            
            const res = await request(app)
              .get('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .expect('Content-Type', /json/)
              .expect(200);

            console.log('res.body:\n',res.body);
              
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(1);
            
            const testLiquor = res.body.data.find(l => l.id === testLiquorId[0]);
            expect(testLiquor).toBeDefined();
            expect(testLiquor.name).toBe(testLiquorId[1]);
          });
        
        test('test request with token with 2 liquor in cabinet', async () => {
            await pool.execute(
              'INSERT INTO user_liquors (user_id, liquor_id) VALUES (?, ?)',
              [testUserId, testLiquorId2[0]]
            );

            const res = await request(app)
              .get('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .expect('Content-Type', /json/)
              .expect(200);

            console.log('res.body:\n',res.body);
              
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(2);
            
            const testLiquor1 = res.body.data.find(l => l.id === testLiquorId[0]);
            console.log('testLiquor1:\n',testLiquor1);
            expect(testLiquor1).toBeDefined();
            expect(testLiquor1.name).toBe(testLiquorId[1]);

            const testLiquor2 = res.body.data.find(l => l.id === testLiquorId2[0]);
            expect(testLiquor2).toBeDefined();
            expect(testLiquor2.name).toBe(testLiquorId2[1]);
            
        });
    });
    

    describe('POST /api/user-liquors/cabinet', () => {
        beforeEach(async () => {
          await pool.execute('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);
        });
        
        test('add liquor to cabinet without token,should return 401', async () => {
          const res = await request(app)
            .post('/api/user-liquors/cabinet')
            .send({ liquorId: testLiquorId[0]})
            .expect('Content-Type', /json/)
            .expect(401);
            
            expect(res.body.success).toBe(false);
        });

        test('add liquor to cabinet without liquor id,should return 400', async () => {
            const res = await request(app)
              .post('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .send()
              .expect('Content-Type', /json/)
              .expect(400);
              
              expect(res.body.success).toBe(false);
          });

        test('add unexist liquor to cabinet,should return 404', async () => {
            const res = await request(app)
              .post('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .send({ liquorId: 999999 })
              .expect('Content-Type', /json/)
              .expect(404);
              
            expect(res.body.success).toBe(false);
          });

        
        test('add liquor to cabinet', async () => {
            //console.log('debug1')
            const res = await request(app)
              .post('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .send({ liquorId: testLiquorId[0]})
              .expect('Content-Type', /json/)
              .expect(201);
              
              expect(res.body.success).toBe(true);
              expect(res.body.data).toHaveProperty('liquor');
          });
        
    

        test('add already in cabinet liquor to cabinet,should return 201', async () => {

            await request(app)
                .post('/api/user-liquors/cabinet')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ liquorId: testLiquorId[0] });
    
            // 再添加同一个酒品
            const res = await request(app)
              .post('/api/user-liquors/cabinet')
              .set('Authorization', `Bearer ${testToken}`)
              .send({ liquorId: testLiquorId[0]})
              .expect('Content-Type', /json/)
              .expect(201);
              
              expect(res.body.success).toBe(true);
          });
    });

    // 测试删除操作
    describe('DELETE /api/user-liquors/cabinet/:liquorId', () => {
        beforeEach(async () => {
            // 清空用户酒柜
            await pool.execute('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);
            // 添加测试酒品到酒柜
            await pool.execute('INSERT INTO user_liquors (user_id, liquor_id) VALUES (?, ?)', 
                [testUserId, testLiquorId[0]]);
        });
        
        test('删除酒柜中的酒品', async () => {
            await request(app)
                .delete(`/api/user-liquors/cabinet/${testLiquorId[0]}`)
                .set('Authorization', `Bearer ${testToken}`)
                .expect(204);
            
            // 验证数据库中已删除
            const [rows] = await pool.execute(
                'SELECT * FROM user_liquors WHERE user_id = ? AND liquor_id = ?', 
                [testUserId, testLiquorId[0]]
            );
            expect(rows.length).toBe(0);
        });
    });
});