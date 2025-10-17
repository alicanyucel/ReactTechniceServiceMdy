import React from 'react'
import './Header.css'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
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