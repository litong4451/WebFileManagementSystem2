const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { users } = require('../index');

// 简单的JWT密钥（实际应用中应使用环境变量）
const JWT_SECRET = 'your-secret-key';
const USER_FILES_DIR = path.join(__dirname, '../../user_files');

// 注册路由
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // 检查用户是否已存在
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      email
    };

    // 添加用户到存储
    users.push(newUser);

    // 创建用户文件目录
    const userDir = path.join(USER_FILES_DIR, username);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 创建JWT令牌
    const token = jwt.sign({
      id: user.id,
      username: user.username
    }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

module.exports = router;