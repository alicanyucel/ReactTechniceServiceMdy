# React Teknik Servis Yönetim Sistemi

AdminLTE benzeri bir düzenle oluşturulmuş modern React + TypeScript + Vite projesi. Üstte Header, solda Sidebar menü, sağda sayfa içerikleri ve altta Footer yapısı bulunur.

## Özellikler
- React 18 + TypeScript
- Vite ile hızlı geliştirme ve build
- React Router ile sayfa yönlendirme
- CSS ile AdminLTE benzeri görünüm
- Docker ve Docker Compose ile kolay dağıtım

## Geliştirme
Yerelde çalıştırmak için:

```cmd
npm install
npm start
```

Build almak için:

```cmd
npm run build
npm run preview
```



## Docker ile Çalıştırma
### 1) Docker image oluşturup Nginx ile servis etme
```cmd
# Image oluştur
docker build -t technic-service:latest .

# Container çalıştır (http://localhost:8080)
docker run --rm -p 8080:80 technic-service:latest
```

### 2) Docker Compose ile
```cmd
# Servisi ayağa kaldır (http://localhost:8080)
docker compose up --build

# Arka plana almak için
docker compose up -d --build

# Durdurmak için
docker compose down
```

## Proje Yapısı
- `src/components/layout/` Header, Sidebar, Footer, MainContent
- `src/pages/` Dashboard ve örnek sayfalar

## Notlar
- Nginx yapılandırması SPA yönlendirmesi (history mode) için `try_files ... /index.html` içerir.
- Üretim modunda dosyalar `dist/` altına derlenir ve Nginx ile sunulur.
