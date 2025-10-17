import React from 'react'
import { Outlet } from 'react-router-dom'
import './MainContent.css'

const MainContent: React.FC = () => {
  return (
    <main className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

export default MainContent