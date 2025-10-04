import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import FileManager from './components/FileManager'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // 检查本地存储中是否有用户信息
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setIsLoggedIn(true)
        setCurrentUser(user)
      } catch (e) {
        // 用户信息解析失败，清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // 处理登录成功
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true)
    setCurrentUser(user)
  }

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>WebFileManagementSystem</h1>
      </header>
      <main className="app-main">
        {isLoggedIn ? (
          <FileManager user={currentUser} onLogout={handleLogout} />
        ) : (
          <Auth onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  )
}

export default App
