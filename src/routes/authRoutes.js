const express = require('express');
const { register, login} = require('../controllers/authController');
const router = express.Router();


// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 用户注销
// router.get('/me', authenticate, getMe);



module.exports = router; 