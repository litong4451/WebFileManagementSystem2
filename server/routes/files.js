const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const USER_FILES_DIR = path.join(__dirname, '../../user_files');

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { username } = req.user;
    const userDir = path.join(USER_FILES_DIR, username);
    // 确保用户目录存在
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 获取文件列表
router.get('/', (req, res) => {
  const { username } = req.user;
  const userDir = path.join(USER_FILES_DIR, username);
  
  try {
    // 读取用户目录下的所有文件和文件夹
    const items = fs.readdirSync(userDir, { withFileTypes: true });
    
    // 格式化结果
    const result = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: `/${item.name}`
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '读取文件列表失败', error: err.message });
  }
});

// 获取指定目录下的文件列表
router.get('/:path*', (req, res) => {
  const { username } = req.user;
  const targetPath = req.params[0] ? `${req.params.path}/${req.params[0]}` : req.params.path;
  const userDir = path.join(USER_FILES_DIR, username, targetPath || '');
  
  try {
    // 检查路径是否存在
    if (!fs.existsSync(userDir)) {
      return res.status(404).json({ message: '路径不存在' });
    }
    
    // 读取指定目录下的所有文件和文件夹
    const items = fs.readdirSync(userDir, { withFileTypes: true });
    
    // 格式化结果
    const result = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: targetPath ? `${targetPath}/${item.name}` : `/${item.name}`
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '读取文件列表失败', error: err.message });
  }
});

// 创建文件夹
router.post('/mkdir', (req, res) => {
  const { username } = req.user;
  const { path: folderPath } = req.body;
  
  if (!folderPath) {
    return res.status(400).json({ message: '文件夹路径不能为空' });
  }
  
  const userDir = path.join(USER_FILES_DIR, username, folderPath);
  
  try {
    // 确保文件夹不存在
    if (fs.existsSync(userDir)) {
      return res.status(400).json({ message: '文件夹已存在' });
    }
    
    // 创建文件夹（包括父文件夹）
    fs.mkdirSync(userDir, { recursive: true });
    
    res.json({ message: '文件夹创建成功' });
  } catch (err) {
    res.status(500).json({ message: '创建文件夹失败', error: err.message });
  }
});

// 上传文件
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有文件被上传' });
  }
  
  res.json({
    message: '文件上传成功',
    filename: req.file.filename,
    path: `/${req.file.filename}`
  });
});

// 下载文件
router.get('/download/:path*', (req, res) => {
  const { username } = req.user;
  const targetPath = req.params[0] ? `${req.params.path}/${req.params[0]}` : req.params.path;
  const filePath = path.join(USER_FILES_DIR, username, targetPath);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 检查是否为文件
    if (fs.statSync(filePath).isDirectory()) {
      return res.status(400).json({ message: '不能下载文件夹' });
    }
    
    // 下载文件
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: '下载文件失败', error: err.message });
  }
});

// 删除文件或文件夹
router.delete('/:path*', (req, res) => {
  const { username } = req.user;
  const targetPath = req.params[0] ? `${req.params.path}/${req.params[0]}` : req.params.path;
  const targetPathFull = path.join(USER_FILES_DIR, username, targetPath);
  
  try {
    // 检查路径是否存在
    if (!fs.existsSync(targetPathFull)) {
      return res.status(404).json({ message: '路径不存在' });
    }
    
    // 检查是否为文件或文件夹
    if (fs.statSync(targetPathFull).isDirectory()) {
      // 删除文件夹（包括所有内容）
      fs.rmdirSync(targetPathFull, { recursive: true });
    } else {
      // 删除文件
      fs.unlinkSync(targetPathFull);
    }
    
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

// 重命名文件或文件夹
router.patch('/rename/:path*', (req, res) => {
  const { username } = req.user;
  const targetPath = req.params[0] ? `${req.params.path}/${req.params[0]}` : req.params.path;
  const { newName } = req.body;
  
  if (!newName || !newName.trim()) {
    return res.status(400).json({ message: '新名称不能为空' });
  }
  
  const targetPathFull = path.join(USER_FILES_DIR, username, targetPath);
  const pathDir = path.dirname(targetPathFull);
  const newPathFull = path.join(pathDir, newName);
  
  try {
    // 检查源文件/文件夹是否存在
    if (!fs.existsSync(targetPathFull)) {
      return res.status(404).json({ message: '文件或文件夹不存在' });
    }
    
    // 检查目标文件/文件夹是否已存在
    if (fs.existsSync(newPathFull)) {
      return res.status(400).json({ message: '目标名称已存在' });
    }
    
    // 执行重命名
    fs.renameSync(targetPathFull, newPathFull);
    
    res.json({ message: '重命名成功' });
  } catch (err) {
    res.status(500).json({ message: '重命名失败', error: err.message });
  }
});

// 移动文件或文件夹
router.patch('/move/:path*', (req, res) => {
  const { username } = req.user;
  const sourcePath = req.params[0] ? `${req.params.path}/${req.params[0]}` : req.params.path;
  const { targetDir } = req.body;
  
  if (!targetDir) {
    return res.status(400).json({ message: '目标目录不能为空' });
  }
  
  const sourcePathFull = path.join(USER_FILES_DIR, username, sourcePath);
  const targetDirFull = path.join(USER_FILES_DIR, username, targetDir);
  const itemName = path.basename(sourcePathFull);
  const targetPathFull = path.join(targetDirFull, itemName);
  
  try {
    // 检查源文件/文件夹是否存在
    if (!fs.existsSync(sourcePathFull)) {
      return res.status(404).json({ message: '源文件或文件夹不存在' });
    }
    
    // 检查目标目录是否存在
    if (!fs.existsSync(targetDirFull)) {
      return res.status(404).json({ message: '目标目录不存在' });
    }
    
    // 检查目标是否为目录
    if (!fs.statSync(targetDirFull).isDirectory()) {
      return res.status(400).json({ message: '目标不是有效的目录' });
    }
    
    // 检查目标文件/文件夹是否已存在
    if (fs.existsSync(targetPathFull)) {
      return res.status(400).json({ message: '目标路径已存在同名文件或文件夹' });
    }
    
    // 执行移动
    fs.renameSync(sourcePathFull, targetPathFull);
    
    res.json({ message: '移动成功' });
  } catch (err) {
    res.status(500).json({ message: '移动失败', error: err.message });
  }
});

// 获取用户列表（用于文件共享）
router.get('/users/list', (req, res) => {
  const { users } = require('../index');
  const userList = users.map(user => ({ id: user.id, username: user.username }));
  res.json(userList);
});

// 共享文件给其他用户
router.post('/share/:path*', (req, res) => {
  const { username } = req.user;
  const filePath = req.params[0] ? `${req.params.path}/${req.params[0]}` : req.params.path;
  const { targetUsername, permission = 'read' } = req.body;
  
  if (!targetUsername) {
    return res.status(400).json({ message: '目标用户名不能为空' });
  }
  
  // 检查目标用户是否存在
  const { users } = require('../index');
  const targetUser = users.find(u => u.username === targetUsername);
  if (!targetUser) {
    return res.status(404).json({ message: '目标用户不存在' });
  }
  
  const sourceFilePath = path.join(USER_FILES_DIR, username, filePath);
  const targetUserDir = path.join(USER_FILES_DIR, targetUsername);
  
  try {
    // 检查源文件是否存在
    if (!fs.existsSync(sourceFilePath)) {
      return res.status(404).json({ message: '源文件不存在' });
    }
    
    // 确保目标用户目录存在
    if (!fs.existsSync(targetUserDir)) {
      fs.mkdirSync(targetUserDir, { recursive: true });
    }
    
    // 对于共享，我们复制文件而不是移动
    const fileName = path.basename(sourceFilePath);
    const targetFilePath = path.join(targetUserDir, fileName);
    
    // 如果目标文件已存在，添加时间戳后缀
    let finalTargetPath = targetFilePath;
    if (fs.existsSync(targetFilePath)) {
      const timestamp = Date.now();
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      finalTargetPath = path.join(targetUserDir, `${baseName}_${timestamp}${ext}`);
    }
    
    // 复制文件
    fs.copyFileSync(sourceFilePath, finalTargetPath);
    
    res.json({ message: '文件共享成功', sharedFilePath: path.basename(finalTargetPath) });
  } catch (err) {
    res.status(500).json({ message: '文件共享失败', error: err.message });
  }
});

module.exports = router;