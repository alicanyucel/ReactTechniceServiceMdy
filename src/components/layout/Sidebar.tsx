import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

interface SidebarProps {
  isCollapsed: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Müşteriler', icon: '👥' },
    { path: '/ürünler', label: 'Ürünler', icon: '📱' },
    { path: '/repairs', label: 'Onarımlar', icon: '🔧' },
    { path: '/inventory', label: 'Envanter', icon: '📦' },
    { path: '/reports', label: 'Raporlar', icon: '📈' },
    { path: '/settings', label: 'Ayarlar', icon: '⚙️' }
  ]

  return (
    <aside className={`main-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-text">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar