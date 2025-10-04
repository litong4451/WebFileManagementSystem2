# Web文件管理系统
# WebFileManagementSystem

WebFileManagementSystem 是一个基于 React.js 和 Node.js 构建的网络文件管理系统，支持用户认证、文件上传/下载、文件夹创建、删除等功能。
WebFileManagementSystem is a web-based file management system built with React.js and Node.js, supporting user authentication, file upload/download, folder creation, deletion and more.


## 部署指南 (Deployment Guide)

### 前端部署 (Frontend Deployment)
1. 在客户端目录中运行构建命令：
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **配置 API 地址**：
   - 在部署前，需要在客户端创建环境变量文件来指定后端 API 地址
   - 在 `client` 目录下创建 `.env` 文件（开发环境）和 `.env.production` 文件（生产环境）
   - 文件内容示例：
     ```
     VITE_API_BASE_URL=https://your-backend-api.onrender.com
     ```

3. **GitHub Pages 部署**：
   - 将项目推送到 GitHub 仓库（仓库名称建议为 `WebFileManagementSystem`）
   - 在 GitHub 仓库设置中启用 GitHub Pages
   - 选择 `gh-pages` 分支或 `main` 分支的 `/client/dist` 目录作为源
   - 部署后访问链接格式：`https://[your-username].github.io/WebFileManagementSystem/`
   - 注意：确保 `.env.production` 文件包含正确的生产环境 API 地址

### 后端部署 (Backend Deployment)
1. **使用 Render、Heroku、Vercel 等平台**：
   - 将后端代码部署到支持 Node.js 的云平台
   - 设置环境变量：确保配置正确的端口和环境设置
   - 获取部署后的 API URL（例如：`https://your-backend-api.onrender.com`）

2. **修改前端 API 请求**：
   - 在部署前端前，需要修改前端代码中的 API 请求地址，指向部署后的后端 API URL

### 完整访问方式 (Complete Access Method)
由于前后端分离架构，用户访问方式如下：

1. **前端访问**：通过 GitHub Pages 链接访问前端界面
2. **API 通信**：前端通过配置的后端 API 地址与后端服务通信

### 注意事项 (Important Notes)
- GitHub Pages 只支持静态网站托管，不支持后端服务
- 后端服务必须部署到支持 Node.js 的服务器或云平台
- 确保后端服务配置了正确的 CORS 策略，允许前端访问
- 部署完成后，用户访问前端页面即可使用完整功能


## 系统架构

- **客户端**: React.js + Vite
- **服务端**: Node.js + Express.js
- **文件存储**: 本地文件系统

## 项目结构

```
├── client/            # 前端项目
│   ├── src/           # 源代码
│   ├── public/        # 静态资源
│   └── package.json   # 前端依赖
├── server/            # 后端项目
│   ├── routes/        # API路由
│   ├── middleware/    # 中间件
│   └── index.js       # 服务端入口
├── user_files/        # 用户文件存储目录
└── README.md          # 项目说明
```

## 功能特性

1. **用户认证**: 支持注册、登录功能
2. **文件管理**: 
   - 浏览文件和文件夹
   - 创建新文件夹
   - 上传文件
   - 下载文件
   - 删除文件或文件夹
3. **多用户支持**: 每个用户有独立的文件存储空间
4. **路径导航**: 支持多层级文件夹结构的导航

## 快速开始

### 环境要求

- Node.js 14.x 或更高版本
- npm 6.x 或更高版本

### 安装和运行

1. **克隆项目**

2. **安装依赖**

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

3. **运行项目**

```bash
# 启动后端服务
cd server
npm run dev

# 启动前端服务（在另一个终端）
cd client
npm run dev
```

4. **访问系统**

打开浏览器，访问 `http://WebFileManagementSystem/`

### 临时演示方案

为了让其他用户能够访问系统，您可以采用以下临时方案：

#### 方案一：使用ngrok将本地服务暴露至公网
1. 下载并安装 [ngrok](https://ngrok.com/)
2. 启动后端服务（运行在端口5000）
3. 运行命令：`ngrok http 5000`
4. 获取ngrok提供的公网URL，如 `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
5. 修改前端API配置，将 `VITE_API_BASE_URL` 设置为该公网URL

#### 方案二：配置hosts文件（内部网络访问）
1. 在您的电脑上（服务器）打开hosts文件：
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - 需要管理员权限编辑
2. 添加一行：`127.0.0.1 WebFileManagementSystem`
3. 保存文件
4. 其他在同一网络的用户也需要修改他们的hosts文件，将 `WebFileManagementSystem` 指向您电脑的IP地址

## 默认账户

系统提供一个默认管理员账户：
- 用户名: admin
- 密码: admin123

## 注意事项

1. 用户文件存储在项目根目录下的 `user_files` 文件夹中
2. 每个用户的文件都存储在以其用户名命名的子文件夹中
3. 本项目仅用于学习和演示，在生产环境中应考虑添加更多的安全措施