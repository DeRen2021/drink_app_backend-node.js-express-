const request = require('supertest');
const app = require('../../../src/app');
const { pool } = require('../../../src/config/db');

describe('userCocktail API测试', () => {
    let testUserId = global.testUserData.id;
    let testToken = global.testToken;
    let testCocktailIngredientIDList = [74,76,79]
    //let testCocktailIngredientNmaeList = ["grenadine","orange_juice","tequila"]
    let testCocktailID = 7

    let testCocktailIngredientIDList2 = [75,77,78]
    let testCocktailID2 = 5
    beforeAll(async () => {
        await pool.query('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);
        await pool.query('DELETE FROM user_cocktails WHERE user_id = ?', [testUserId]);
    });

    afterAll(async () => {
        await pool.execute('DELETE FROM user_cocktails WHERE user_id = ?', [testUserId]);
        await pool.execute('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);
    });

    describe('GET /api/user-cocktails', () => {
        test('test request without token,should return 401', async () => {
            const res = await request(app)
                .get('/api/user-cocktails')
                .expect('Content-Type', /json/)
                .expect(401);
                
            expect(res.body.success).toBe(false);
        });

        test('test request with token but empty cabinet,should return 200', async () => {
            const res = await request(app)
                .get('/api/user-cocktails')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('res.body:\n', res.body);
            
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(0);
        });

        test('add ingredients for 1 cocktail to the cabinet,should return 200', async () => {
            // 首先添加一些酒品到用户酒柜
            const rows = testCocktailIngredientIDList.map(liquorId => [testUserId, liquorId]);


            await pool.query(
                'INSERT INTO user_liquors (user_id, liquor_id) VALUES ?',
                [rows]
            );
            
            // 刷新用户鸡尾酒列表
            const res1 = await request(app)
                .post('/api/user-cocktails/refresh')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            console.log('res1.body:\n', res1.body);
            
            // 获取用户鸡尾酒
            const res2 = await request(app)
                .get('/api/user-cocktails')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('res2.body:\n', res2.body);
            console.log('ingredient_name:\n', res2.body.data[0].ingredients);
            
            expect(res2.body.success).toBe(true);
            expect(Array.isArray(res2.body.data)).toBe(true);
            expect(res2.body.data.length).toBe(1);
            expect(res2.body.data[0].cocktail_id).toBe(testCocktailID);
            // 检查是否有鸡尾酒（具体数量取决于测试数据库中的数据）
        });

        test('add another ingredients for 1 cocktail to the cabinet,should return 200', async () => {

            const rows2 = testCocktailIngredientIDList2.map(liquorId => [testUserId, liquorId]);

            await pool.query(
                'INSERT INTO user_liquors (user_id, liquor_id) VALUES ?',
                [rows2]
            );
            
            // 刷新用户鸡尾酒列表
            const res1 = await request(app)
                .post('/api/user-cocktails/refresh')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            console.log('res1.body:\n', res1.body);
            
            // 获取用户鸡尾酒
            const res2 = await request(app)
                .get('/api/user-cocktails')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('res2.body:\n', res2.body);
            
            expect(res2.body.success).toBe(true);
            expect(Array.isArray(res2.body.data)).toBe(true);
            expect(res2.body.data.length).toBe(2);

            //modify this logic later depend on list ordering
            expect(res2.body.data[0].cocktail_id).toBe(testCocktailID2);
            expect(res2.body.data[1].cocktail_id).toBe(testCocktailID);
            // 检查是否有鸡尾酒（具体数量取决于测试数据库中的数据）
        });
    });

    describe('POST /api/user-cocktails/refresh', () => {
        
        beforeEach(async () => {
            await pool.execute('DELETE FROM user_cocktails WHERE user_id = ?', [testUserId]);
            await pool.execute('DELETE FROM user_liquors WHERE user_id = ?', [testUserId]);
        });

        test('check user cocktail table', async () => {
            const res = await request(app)
                .get('/api/user-cocktails')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('current user cocktail table:\n', res.body);
        });


        test('无token请求刷新应返回401', async () => {
            const res = await request(app)
                .post('/api/user-cocktails/refresh')
                .expect('Content-Type', /json/)
                .expect(401);
                
            expect(res.body.success).toBe(false);
        });

        test('使用token请求刷新应成功', async () => {
            const res = await request(app)
                .post('/api/user-cocktails/refresh')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('刷新结果:\n', res.body);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data.added).toBe('number');
            expect(typeof res.body.data.removed).toBe('number');
        });
        

        test('remove one liquor ingredient from the cabinet,should return 200', async () => {
            // 先添加一些酒品和刷新鸡尾酒
            const rows = testCocktailIngredientIDList.map(liquorId => [testUserId, liquorId]);


            await pool.query(
                'INSERT INTO user_liquors (user_id, liquor_id) VALUES ?',
                [rows]
            );

            await request(app)
                .post('/api/user-cocktails/refresh')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);

            const res1 = await request(app)
                .get('/api/user-cocktails')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('res1.body:\n', res1.body);
            expect(res1.body.success).toBe(true);
            expect(res1.body.success).toBe(true);
            expect(Array.isArray(res1.body.data)).toBe(true);
            expect(res1.body.data.length).toBe(1);

            await pool.execute(
                'DELETE FROM user_liquors WHERE user_id = ? AND liquor_id = ?',
                [testUserId, testCocktailIngredientIDList[0]]
              );
            
            await request(app)
                .post('/api/user-cocktails/refresh')
                .set('Authorization', `Bearer ${testToken}`)
                .expect(200);
            
            
            const res = await request(app)
                .get('/api/user-cocktails')
                .set('Authorization', `Bearer ${testToken}`)
                .expect('Content-Type', /json/)
                .expect(200);
            
            console.log('res body:\n', res.body);
            
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(0);
        });
    });
});