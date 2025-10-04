import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 从环境变量获取API基础URL，如果没有设置则使用默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const FileManager = ({ user, onLogout }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [moveItem, setMoveItem] = useState(null);
  const [targetDir, setTargetDir] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [targetUsername, setTargetUsername] = useState('');
  const [userList, setUserList] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  // 获取文件列表
  const fetchFileList = async (path = '') => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      const response = await axios.get(`${API_BASE_URL}/files${path}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setFileList(response.data);
      setCurrentPath(path);
    } catch (err) {
      setError(err.response?.data?.message || '获取文件列表失败');
      if (err.response?.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和路径变化时获取文件列表
  useEffect(() => {
    fetchFileList(currentPath);
  }, []);

  // 导航到子文件夹
  const navigateToFolder = (folder) => {
    const newPath = currentPath === '' ? `/${folder.name}` : `${currentPath}/${folder.name}`;
    fetchFileList(newPath);
  };

  // 返回上一级
  const goBack = () => {
    if (currentPath === '') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '';
    fetchFileList(newPath);
  };

  // 创建新文件夹
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      setError('文件夹名称不能为空');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const folderPath = currentPath === '' ? newFolderName : `${currentPath}/${newFolderName}`;
      
      // 使用相对路径，确保系统可以在不同环境下正常访问
      await axios.post(`${API_BASE_URL}/files/mkdir`, 
        { path: folderPath },
        { headers: { 'x-auth-token': token } }
      );
      
      // 刷新文件列表
      fetchFileList(currentPath);
      setShowNewFolderModal(false);
      setNewFolderName('');
    } catch (err) {
      setError(err.response?.data?.message || '创建文件夹失败');
    }
  };

  // 上传文件
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      // 使用相对路径，确保系统可以在不同环境下正常访问
      await axios.post(`${API_BASE_URL}/files/upload`, 
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // 刷新文件列表
      fetchFileList(currentPath);
      // 重置文件输入
      e.target.value = '';
    } catch (err) {
      setError(err.response?.data?.message || '文件上传失败');
    }
  };

  // 下载文件
  const downloadFile = async (file) => {
    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      const response = await axios.get(`${API_BASE_URL}/files/download${file.path}`, {
        headers: {
          'x-auth-token': token
        },
        responseType: 'blob'
      });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      
      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || '文件下载失败');
    }
  };

  // 删除文件或文件夹
  const deleteItem = async (item) => {
    if (!window.confirm(`确定要删除${item.isDirectory ? '文件夹' : '文件'} "${item.name}"吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      await axios.delete(`${API_BASE_URL}/files${item.path}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      // 刷新文件列表
      fetchFileList(currentPath);
    } catch (err) {
      setError(err.response?.data?.message || '删除失败');
    }
  };

  // 重命名文件或文件夹
  const handleRename = (item) => {
    setRenameItem(item);
    setNewName(item.name);
    setShowRenameModal(true);
  };

  const confirmRename = async () => {
    if (!newName.trim()) {
      setError('新名称不能为空');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      await axios.patch(`${API_BASE_URL}/files/rename${renameItem.path}`,
        { newName: newName.trim() },
        { headers: { 'x-auth-token': token } }
      );
      
      // 刷新文件列表
      fetchFileList(currentPath);
      setShowRenameModal(false);
      setRenameItem(null);
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.message || '重命名失败');
    }
  };

  // 移动文件或文件夹
  const handleMove = (item) => {
    setMoveItem(item);
    setTargetDir('');
    setShowMoveModal(true);
  };

  const confirmMove = async () => {
    if (!targetDir.trim()) {
      setError('目标目录不能为空');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      await axios.patch(`${API_BASE_URL}/files/move${moveItem.path}`,
        { targetDir: targetDir.trim() },
        { headers: { 'x-auth-token': token } }
      );
      
      // 刷新文件列表
      fetchFileList(currentPath);
      setShowMoveModal(false);
      setMoveItem(null);
      setTargetDir('');
    } catch (err) {
      setError(err.response?.data?.message || '移动失败');
    }
  };

  // 获取用户列表用于共享
  const fetchUserList = async () => {
    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      const response = await axios.get(`${API_BASE_URL}/files/users/list`, {
        headers: { 'x-auth-token': token }
      });
      // 过滤掉当前用户
      setUserList(response.data.filter(u => u.username !== user.username));
    } catch (err) {
      setError(err.response?.data?.message || '获取用户列表失败');
    }
  };

  // 共享文件
  const handleShare = (item) => {
    if (item.isDirectory) {
      setError('当前版本不支持文件夹共享');
      return;
    }
    setShareItem(item);
    setTargetUsername('');
    fetchUserList();
    setShowShareModal(true);
  };

  const confirmShare = async () => {
    if (!targetUsername) {
      setError('请选择要共享的用户');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 使用相对路径，确保系统可以在不同环境下正常访问
      await axios.post(`${API_BASE_URL}/files/share${shareItem.path}`,
        { targetUsername },
        { headers: { 'x-auth-token': token } }
      );
      
      alert('文件共享成功！');
      setShowShareModal(false);
      setShareItem(null);
      setTargetUsername('');
    } catch (err) {
      setError(err.response?.data?.message || '共享失败');
    }
  };

  // 渲染路径导航
  const renderPathNavigation = () => {
    if (currentPath === '') {
      return <span>我的文件</span>;
    }

    const pathParts = currentPath.split('/').filter(Boolean);
    const paths = [];
    
    paths.push({
      name: '我的文件',
      path: ''
    });
    
    let currentPathSoFar = '';
    for (const part of pathParts) {
      currentPathSoFar += `/${part}`;
      paths.push({
        name: part,
        path: currentPathSoFar
      });
    }
    
    return (
      <div className="path-navigation">
        {paths.map((p, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span> / </span>}
            <button
              className={index === paths.length - 1 ? 'active' : ''}
              onClick={() => fetchFileList(p.path)}
            >
              {p.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="file-manager">
      {/* 顶部导航栏 */}
      <div className="header">
        <div className="path-section">
          {renderPathNavigation()}
        </div>
        <div className="user-section">
          <span>欢迎, {user.username}</span>
          <button className="logout-btn" onClick={onLogout}>退出登录</button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="toolbar">
        <button onClick={goBack} disabled={currentPath === ''}>返回上一级</button>
        <button onClick={() => setShowNewFolderModal(true)}>新建文件夹</button>
        <label className="upload-btn">
          上传文件
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* 错误信息 */}
      {error && <div className="error-message">{error}</div>}

      {/* 文件列表 */}
      <div className="file-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          fileList.map((item, index) => (
            <div key={index} className="file-item">
              <div className="item-icon">
                {item.isDirectory ? '📁' : '📄'}
              </div>
              <div className="item-name">
                {item.isDirectory ? (
                  <button onClick={() => navigateToFolder(item)} className="folder-name">
                    {item.name}
                  </button>
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
              <div className="item-actions">
                {!item.isDirectory && (
                  <button onClick={() => downloadFile(item)}>下载</button>
                )}
                <button onClick={() => handleRename(item)}>重命名</button>
                <button onClick={() => handleMove(item)}>移动</button>
                {!item.isDirectory && (
                  <button onClick={() => handleShare(item)}>共享</button>
                )}
                <button onClick={() => deleteItem(item)}>删除</button>
              </div>
            </div>
          ))
        )}
        {!loading && fileList.length === 0 && (
          <div className="empty-folder">当前文件夹为空</div>
        )}
      </div>

      {/* 新建文件夹模态框 */}
      {showNewFolderModal && (
        <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>新建文件夹</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="请输入文件夹名称"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowNewFolderModal(false)}>取消</button>
              <button onClick={createFolder}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 重命名模态框 */}
      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>重命名{renameItem?.isDirectory ? '文件夹' : '文件'}</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`请输入新的${renameItem?.isDirectory ? '文件夹' : '文件'}名称`}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => {
                setShowRenameModal(false);
                setRenameItem(null);
                setNewName('');
              }}>取消</button>
              <button onClick={confirmRename}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 移动模态框 */}
      {showMoveModal && (
        <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>移动{moveItem?.isDirectory ? '文件夹' : '文件'}</h3>
            <p>当前位置: {currentPath || '/'} </p>
            <input
              type="text"
              value={targetDir}
              onChange={(e) => setTargetDir(e.target.value)}
              placeholder="请输入目标目录路径 (例如: /documents/work)"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => {
                setShowMoveModal(false);
                setMoveItem(null);
                setTargetDir('');
              }}>取消</button>
              <button onClick={confirmMove}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 共享模态框 */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>共享文件</h3>
            <p>文件名称: {shareItem?.name}</p>
            <label htmlFor="share-user">选择用户:</label>
            <select
              id="share-user"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
            >
              <option value="">请选择用户</option>
              {userList.map(user => (
                <option key={user.id} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => {
                setShowShareModal(false);
                setShareItem(null);
                setTargetUsername('');
              }}>取消</button>
              <button onClick={confirmShare}>共享</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;