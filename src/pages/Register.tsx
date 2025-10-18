import React, { useState } from 'react'
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Form, Input, Typography, message, Select, Switch } from 'antd'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/auth'

const { Title, Text } = Typography

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: { 
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    roles: string[]
    updatedTime: string
    updatedBy: string
    createdBy: string
    cratedTime: string
    createadAt: string
    updatedAt: string
    isDeleted: boolean
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Şifreler eşleşmiyor')
      return
    }

    setLoading(true)
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        roles: values.roles,
        updatedTime: values.updatedTime,
        updatedBy: values.updatedBy,
        createdBy: values.createdBy,
        cratedTime: values.cratedTime,
        createadAt: values.createadAt,
        updatedAt: values.updatedAt,
        isDeleted: values.isDeleted
      })
      message.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err: any) {
      message.error(err?.message || 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#f5f5f5', padding: 16 }}>
      <Card style={{ width: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <Flex vertical align="center" style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Teknik Servis</Title>
          <Text type="secondary">Yeni kullanıcı oluşturun</Text>
        </Flex>
        <Form 
          name="register" 
          layout="vertical" 
          onFinish={onFinish} 
          autoComplete="off"
          initialValues={{
            roles: ["User"],
            updatedTime: new Date().toISOString(),
            updatedBy: "System",
            createdBy: "System",
            cratedTime: new Date().toISOString(),
            createadAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false
          }}
        >
          <Form.Item
            label="Ad"
            name="firstName"
            rules={[{ required: true, message: 'Lütfen adınızı girin' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Adınız" size="large" />
          </Form.Item>

          <Form.Item
            label="Soyad"
            name="lastName"
            rules={[{ required: true, message: 'Lütfen soyadınızı girin' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Soyadınız" size="large" />
          </Form.Item>

          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'Lütfen e-posta adresinizi girin' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="ornek@firma.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[
              { required: true, message: 'Lütfen şifrenizi girin' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item
            label="Şifre Tekrar"
            name="confirmPassword"
            rules={[{ required: true, message: 'Lütfen şifrenizi tekrar girin' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item
            label="Roller"
            name="roles"
            rules={[{ required: true, message: 'Lütfen en az bir rol seçin' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Roller seçin"
              size="large"
              options={[
                { value: "User", label: "User" },
                { value: "Admin", label: "Admin" },
                { value: "Manager", label: "Manager" },
                { value: "Technician", label: "Technician" }
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Güncelleme Zamanı"
            name="updatedTime"
            rules={[{ required: true, message: 'Güncelleme zamanı gerekli' }]}
          >
            <Input placeholder="2025-10-18T08:57:06.606Z" size="large" />
          </Form.Item>

          <Form.Item
            label="Güncelleyen"
            name="updatedBy"
            rules={[{ required: true, message: 'Güncelleyen bilgisi gerekli' }]}
          >
            <Input placeholder="System" size="large" />
          </Form.Item>

          <Form.Item
            label="Oluşturan"
            name="createdBy"
            rules={[{ required: true, message: 'Oluşturan bilgisi gerekli' }]}
          >
            <Input placeholder="System" size="large" />
          </Form.Item>

          <Form.Item
            label="Oluşturma Zamanı"
            name="cratedTime"
            rules={[{ required: true, message: 'Oluşturma zamanı gerekli' }]}
          >
            <Input placeholder="2025-10-18T08:57:06.606Z" size="large" />
          </Form.Item>

          <Form.Item
            label="Oluşturulma Tarihi"
            name="createadAt"
            rules={[{ required: true, message: 'Oluşturulma tarihi gerekli' }]}
          >
            <Input placeholder="2025-10-18T08:57:06.606Z" size="large" />
          </Form.Item>

          <Form.Item
            label="Güncellenme Tarihi"
            name="updatedAt"
            rules={[{ required: true, message: 'Güncellenme tarihi gerekli' }]}
          >
            <Input placeholder="2025-10-18T08:57:06.606Z" size="large" />
          </Form.Item>

          <Form.Item
            label="Silinmiş mi?"
            name="isDeleted"
            valuePropName="checked"
          >
            <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Kayıt Ol
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Text type="secondary">
              Zaten hesabınız var mı?{' '}
              <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                Giriş Yap
              </Button>
            </Text>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  )
}

export default Register
