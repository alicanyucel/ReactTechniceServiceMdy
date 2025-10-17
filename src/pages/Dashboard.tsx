import React from 'react'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="content-header">
        <h1>Dashboard</h1>
        <p>Teknik servis yönetim paneline hoş geldiniz</p>
      </div>
      
      <div className="row">
        <div className="col-lg-3 col-6">
          <div className="small-box bg-info">
            <div className="inner">
              <h3>150</h3>
              <p>Toplam Müşteri</p>
            </div>
            <div className="icon">
              <span>👥</span>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="small-box bg-success">
            <div className="inner">
              <h3>53</h3>
              <p>Tamamlanan Onarım</p>
            </div>
            <div className="icon">
              <span>✅</span>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="small-box bg-warning">
            <div className="inner">
              <h3>44</h3>
              <p>Bekleyen Onarım</p>
            </div>
            <div className="icon">
              <span>⏳</span>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="small-box bg-danger">
            <div className="inner">
              <h3>65</h3>
              <p>Toplam Cihaz</p>
            </div>
            <div className="icon">
              <span>📱</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Son Onarımlar</h3>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li>iPhone 12 - Ekran Değişimi - Ali Yılmaz</li>
                <li>Samsung Galaxy S21 - Batarya Değişimi - Ayşe Kaya</li>
                <li>Huawei P30 - Şarj Soketi Onarımı - Mehmet Demir</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bugünün Randevuları</h3>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li>09:00 - iPad Air Ekran Onarımı</li>
                <li>11:30 - MacBook Klavye Değişimi</li>
                <li>14:00 - Xiaomi Mi 11 Kamera Onarımı</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard