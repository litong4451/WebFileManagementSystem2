import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/WebFileManagementSystem/', // GitHub Pages 部署时的基础路径
  server: {
    port: 3000,
    proxy: {
      // 将所有/api/请求代理到后端服务器
      '/api': {
        target: 'http://WebFileManagementSystem/', // 使用指定的域名
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
