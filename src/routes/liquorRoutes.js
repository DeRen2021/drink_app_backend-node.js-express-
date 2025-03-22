const express = require('express');
const router = express.Router();
const liquorController = require('../controllers/liquorController');

// 获取所有酒类
router.get('/', liquorController.getAllLiquors);

// 根据名称获取酒类
router.get('/name/:name', liquorController.getLiquorByName);

// 根据名称获取酒类ID
router.get('/id-by-name/:name', liquorController.getLiquorIdByName);

// 获取单个酒类
router.get('/:id', liquorController.getLiquorById);

module.exports = router; 