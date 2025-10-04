const jwt = require('jsonwebtoken');
const { users } = require('../index');

// 简单的JWT密钥（实际应用中应使用环境变量）
const JWT_SECRET = 'your-secret-key';

const authMiddleware = (req, res, next) => {
  // 从请求头中获取token
  const token = req.header('x-auth-token');

  // 检查token是否存在
  if (!token) {
    return res.status(401).json({ message: '没有提供认证令牌，拒绝访问' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查用户是否存在
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    
    // 将用户信息添加到请求对象中
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: '无效的认证令牌' });
  }
};

module.exports = authMiddleware;