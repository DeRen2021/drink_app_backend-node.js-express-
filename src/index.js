const app = require('./app');
const logger = require('./utils/logger');

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`服务器运行在端口: ${PORT}`);
});