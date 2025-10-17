import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          <strong>MUDBEY YAZILIM TEKNİK SERVİS YÖNETİMİ</strong> © 2025
        </div>
        <div className="footer-right">
          Versiyon <b>1.0.0</b>
        </div>
      </div>
    </footer>
  )
}

export default Footer