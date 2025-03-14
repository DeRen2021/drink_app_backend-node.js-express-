const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { getMe,deleteAccount } = require('../controllers/authController');
const router = express.Router();

// 获取当前用户信息
router.get('/me', authenticate, getMe);

// 注销用户
router.delete('/account', authenticate, deleteAccount);

module.exports = router; 