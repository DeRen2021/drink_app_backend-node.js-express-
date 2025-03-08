const express = require('express');
const router = express.Router();
const liquorController = require('../controllers/liquorController');

// 获取所有酒类
router.get('/', liquorController.getAllLiquors);

// 获取单个酒类
router.get('/:id', liquorController.getLiquorById);

module.exports = router; 