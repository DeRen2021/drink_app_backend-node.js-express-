const express = require('express');
const { authenticate } = require('../middlewares/auth');
const {
  getUserLiquors,
  getAllLiquorsWithUserStatus,
  addLiquorToUserCabinet,
  addLiquorToUserCabinetByName,
  removeLiquorFromUserCabinet,
  searchLiquorsWithUserStatus
} = require('../controllers/userLiquorController');

const router = express.Router();

// 所有路由都需要认证
router.use(authenticate);

// 获取用户酒柜中的所有酒品
router.get('/cabinet', getUserLiquors);

// 获取所有酒品并标记用户已添加的酒品
router.get('/all', getAllLiquorsWithUserStatus);

// 搜索酒品并标记用户已添加的酒品
router.get('/search', searchLiquorsWithUserStatus);

// 添加酒品到用户酒柜
router.post('/cabinet/add', addLiquorToUserCabinet);

// 根据酒名添加酒品到用户酒柜
router.post('/cabinet/add-by-name', addLiquorToUserCabinetByName);

// 从用户酒柜中移除酒品
router.post('/cabinet/remove', removeLiquorFromUserCabinet);

module.exports = router; 