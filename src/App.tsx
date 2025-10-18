import React, { useMemo, useState } from 'react'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import AppRouter from './AppRouter'
import './App.css'

const Shell: React.FC = () => {
  const location = useLocation()
  const isLogin = useMemo(() => location.pathname === '/login', [location.pathname])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="wrapper">
      {!isLogin && <Header onToggleSidebar={toggleSidebar} />}
      {!isLogin && <Sidebar isCollapsed={sidebarCollapsed} />} 
      <div className={`content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AppRouter />
      </div>
      {!isLogin && <Footer />}
    </div>
  )
}

const App: React.FC = () => (
  <Router>
    <Shell />
  </Router>
)

export default App