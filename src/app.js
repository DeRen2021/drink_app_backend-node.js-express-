const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// load routes
const liquorRoutes = require('./routes/liquorRoutes');
const cocktailRoutes = require('./routes/cocktailRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userLiquorRoutes = require('./routes/userLiquorRoutes');
const userCocktailRoutes = require('./routes/userCocktailRoutes');

// load logger
const { requestLogger, errorLogger } = require('./middlewares/logging');
const logger = require('./utils/logger');

dotenv.config();
const app = express();

const allowedOrigins = ["*"]; // since its ios app from now, allow all origins
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加请求日志中间件（放在其他中间件之后，路由之前）
app.use(requestLogger);

// 测试数据库连接
//testConnection();

// 路由
app.use('/api/liquors', liquorRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-liquors', userLiquorRoutes);
app.use('/api/user-cocktails', userCocktailRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用饮料应用API',
    version: '1.0.0'
  });
});

// 处理404错误
app.use((req, res) => {
  logger.warn(`请求未找到: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: '未找到请求的资源'
  });
});

// 错误日志中间件
app.use(errorLogger);

// 全局错误处理
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 导出app实例供测试使用
module.exports = app;
