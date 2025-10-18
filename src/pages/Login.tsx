import React, { useEffect, useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Form, Input, Typography, notification } from 'antd'
import { login } from '../services/auth'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    const existing = localStorage.getItem('authToken')
    if (existing) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const onFinish = async (values: { emailOrUserName: string; password: string }) => {
    setLoading(true)
    try {
      await login(values)
      const token = localStorage.getItem('authToken')
      if (token) {
        notification.success({
          message: 'Giriş başarılı',
          description: 'Hoş geldiniz.',
          placement: 'topRight',
        })
        navigate('/', { replace: true })
      } else {
        notification.warning({
          message: 'Oturum anahtarı alınamadı',
          description: 'Giriş başarılı görünüyor ancak oturum anahtarı bulunamadı. Lütfen tekrar deneyin.',
          placement: 'topRight',
        })
      }
    } catch (err: any) {
      const rawMsg = String(err?.message || '')
      let title = 'Giriş başarısız'
      let desc = 'Lütfen bilgilerinizi kontrol edip tekrar deneyin.'

      const msg = rawMsg.toLowerCase()
      if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
        title = 'Ağ bağlantı hatası'
        desc = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı ve sunucu durumunu kontrol edin.'
      } else if (msg.includes('401')) {
        title = 'Geçersiz bilgiler'
        desc = 'Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.'
      } else if (msg.includes('403')) {
        title = 'Erişim reddedildi'
        desc = 'Bu işlem için yetkiniz bulunmuyor.'
      } else if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
        title = 'Sunucu hatası'
        desc = 'Şu anda bir sorun var. Bir süre sonra tekrar deneyin.'
      } else {
        // Specific friendly mapping for lockout scenarios and generic backend texts
        const lockoutPatterns = [
          '3 defa',
          'bloke',
          'kullanıcı',
        ]
        if (lockoutPatterns.every(p => msg.includes(p))) {
          title = 'Hesap geçici olarak kilitlendi'
          desc = 'Şifrenizi 3 kez hatalı girdiğiniz için hesap 2 dakika kilitlendi. Lütfen birkaç dakika sonra tekrar deneyin.'
        } else if (rawMsg && rawMsg.trim().length > 0 && rawMsg.trim().length < 200) {
          // Keep backend text but still framed as friendly
          desc = rawMsg
        }
      }

      notification.error({
        message: title,
        description: desc,
        placement: 'topRight',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#f5f5f5', padding: 16 }}>
      <Card style={{ width: 360 }}>
        <Flex vertical align="center" style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Teknik Servis</Title>
          <Text type="secondary">Hesabınıza giriş yapın</Text>
        </Flex>
        <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="E-posta / Kullanıcı Adı"
            name="emailOrUserName"
            rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="ornek@firma.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[{ required: true, message: 'Lütfen şifrenizi girin' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Giriş Yap
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Text type="secondary">
              Henüz hesabınız yok mu?{' '}
              <Button type="link" onClick={() => navigate('/register')} style={{ padding: 0 }}>
                Kayıt Ol
              </Button>
            </Text>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  )
}

export default Login
