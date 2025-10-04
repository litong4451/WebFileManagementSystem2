const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 确保用户文件目录存在
const USER_FILES_DIR = path.join(__dirname, '../user_files');
if (!fs.existsSync(USER_FILES_DIR)) {
  fs.mkdirSync(USER_FILES_DIR, { recursive: true });
}

// 模拟用户数据存储
let users = [
  {
    id: '1',
    username: 'admin',
    password: '$2b$10$W9s8Q2Y6d9E3c5R8f7V9u1i0O2p4A5s7D8f9G0h1J2k3L4M5n6O7P8Q9R0S1T2U3V4W5X6Y7Z8', // admin123
    email: 'admin@example.com'
  }
];

// 路由
const authMiddleware = require('./middleware/auth');
const usersRoutes = require('./routes/users');
const filesRoutes = require('./routes/files');

app.use('/api/users', usersRoutes);
app.use('/api/files', authMiddleware, filesRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.send('WebFileManagementSystem Server is running');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`用户文件存储目录: ${USER_FILES_DIR}`);
});

// 导出app和users供其他模块使用
module.exports = { app, users };