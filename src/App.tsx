import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import AppRouter from './AppRouter'
import './App.css'

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <Router>
      <div className="wrapper">
        <Header onToggleSidebar={toggleSidebar} />
        <Sidebar isCollapsed={sidebarCollapsed} />
        <div className={`content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <AppRouter />
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App