import React, { useEffect, useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Form, Input, Typography, message } from 'antd'
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
        message.success('Giriş başarılı')
        navigate('/', { replace: true })
      } else {
        message.error('Giriş başarılı görünüyor ancak oturum anahtarı alınamadı')
      }
    } catch (err: any) {
      message.error(err?.message || 'Giriş başarısız')
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
