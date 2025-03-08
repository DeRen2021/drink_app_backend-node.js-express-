-- 如果表已存在则添加到现有表后面
-- 如果文件不存在则创建完整的表结构

-- 用户鸡尾酒表
CREATE TABLE IF NOT EXISTS user_cocktails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cocktail_id INT NOT NULL,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_cocktail_unique (user_id, cocktail_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cocktail_id) REFERENCES cocktails(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 