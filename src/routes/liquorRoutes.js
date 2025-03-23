const express = require('express');
const router = express.Router();
const liquorController = require('../controllers/liquorController');

// RESTful路由
// 获取所有酒类列表 - GET /api/liquors
router.get('/', liquorController.getAllLiquors);

// 根据名称精确查询酒类 - GET /api/liquors/name/:name
router.get('/name/:name', liquorController.getLiquorByName);

// 获取所有酒类类型 - GET /api/liquors/types
router.get('/types', liquorController.getLiquorTypes);

// 获取单个酒类 - GET /api/liquors/:id
router.get('/:id', liquorController.getLiquorById);

module.exports = router; 