const express = require('express');
const router = express.Router();
const userCocktailController = require('../controllers/userCocktailController');
const { authenticate } = require('../middlewares/auth');

// 路由需要认证中间件
router.use(authenticate);

// 获取用户可以制作的鸡尾酒
router.get('/', userCocktailController.getUserCocktails);

// 手动刷新用户可以制作的鸡尾酒
router.post('/refresh', userCocktailController.refreshUserCocktails);

module.exports = router; 