-- 创建数据库
CREATE DATABASE IF NOT EXISTS drink_app;

-- 使用数据库
USE drink_app;

-- 创建饮料表
CREATE TABLE IF NOT EXISTS drinks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入一些示例数据
INSERT INTO drinks (name, description, price, image_url, category) VALUES
('冰美式咖啡', '清爽的美式咖啡配以冰块', 18.00, 'https://example.com/iced-americano.jpg', '咖啡'),
('拿铁', '浓缩咖啡与蒸汽牛奶的经典组合', 22.00, 'https://example.com/latte.jpg', '咖啡'),
('抹茶拿铁', '优质抹茶粉与牛奶的完美结合', 25.00, 'https://example.com/matcha-latte.jpg', '茶饮'),
('草莓奶昔', '新鲜草莓与香草冰淇淋混合而成', 28.00, 'https://example.com/strawberry-milkshake.jpg', '奶昔'),
('柠檬水', '清新的柠檬与纯净水的简单组合', 15.00, 'https://example.com/lemonade.jpg', '果汁'),
('芒果冰沙', '新鲜芒果与冰块打成的冰沙', 26.00, 'https://example.com/mango-smoothie.jpg', '冰沙');

-- 创建用户表（如果需要用户认证）
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表（如果需要订单功能）
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建订单项表（如果需要订单功能）
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  drink_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (drink_id) REFERENCES drinks(id) ON DELETE CASCADE
); 