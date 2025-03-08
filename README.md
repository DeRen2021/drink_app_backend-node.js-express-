# 饮料应用后端 API

这是一个基于 Node.js、Express 和 MySQL 的饮料应用后端 API。

## 功能特点

- RESTful API 设计
- MySQL 数据库集成
- 饮料的 CRUD 操作
- 按类别筛选饮料
- 错误处理和日志记录
- CORS 支持

## 技术栈

- Node.js
- Express.js
- MySQL
- dotenv (环境变量管理)
- cors (跨域资源共享)

## 安装

1. 克隆仓库：

```bash
git clone <仓库地址>
cd drink_app_backend
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

创建 `.env` 文件并设置以下变量：

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=drink_app
DB_PORT=3306
```

4. 初始化数据库：

在 MySQL 中执行 `src/utils/init-db.sql` 脚本：

```bash
mysql -u root -p < src/utils/init-db.sql
```

## 运行

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

## API 端点

### 饮料

- `GET /api/drinks` - 获取所有饮料
- `GET /api/drinks/:id` - 获取单个饮料
- `POST /api/drinks` - 创建新饮料
- `PUT /api/drinks/:id` - 更新饮料
- `DELETE /api/drinks/:id` - 删除饮料
- `GET /api/drinks/category/:category` - 按类别获取饮料

## 请求示例

### 创建新饮料

```bash
curl -X POST http://localhost:3000/api/drinks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "卡布奇诺",
    "description": "意大利经典咖啡，由等量的浓缩咖啡、蒸汽牛奶和奶泡组成",
    "price": 24.00,
    "image_url": "https://example.com/cappuccino.jpg",
    "category": "咖啡"
  }'
```

## 项目结构

```
drink_app_backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── utils/          # 工具函数和SQL脚本
│   └── index.js        # 应用入口
├── .env                # 环境变量
├── package.json        # 项目依赖
└── README.md           # 项目文档
```

## 许可证

MIT 