const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { getMe } = require('../controllers/authController');
const router = express.Router();

// 获取当前用户信息
router.get('/me', authenticate, getMe);

module.exports = router; 