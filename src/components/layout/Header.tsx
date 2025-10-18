import React from 'react'
import './Header.css'
import { Button, Space, message } from 'antd'
import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/auth'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    message.success('Çıkış yapıldı')
    navigate('/login', { replace: true })
  }

  const goRegister = () => {
    navigate('/register')
  }
  return (
    <header className="main-header">
      <div className="navbar">
        <div className="navbar-brand">
          <button 
            className="sidebar-toggle" 
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger-icon">☰</span>
          </button>
          <span className="brand-text">Teknik Servis</span>
        </div>
        
        <div className="navbar-nav">
          <Space size={12} align="center" style={{ height: '100%' }}>
            <Button 
              size="middle" 
              icon={<UserAddOutlined />} 
              type="primary" 
              onClick={goRegister}
            >
              Kayıt
            </Button>
            <Button 
              size="middle" 
              icon={<LogoutOutlined />} 
              danger 
              onClick={handleLogout}
            >
              Çıkış
            </Button>
          </Space>
          <div className="nav-item dropdown">
            <button className="nav-link dropdown-toggle">
              <span className="user-icon">👤</span>
              <span className="user-name">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header