const express = require('express');
const router = express.Router();
const cocktailController = require('../controllers/cocktailController');

// 获取所有鸡尾酒
router.get('/', cocktailController.getAllCocktails);

module.exports = router;