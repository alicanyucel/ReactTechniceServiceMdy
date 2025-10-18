import React, { useState } from 'react'
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Form, Input, Typography, message, Select, Switch, Row, Col, DatePicker } from 'antd'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/auth'
import dayjs from 'dayjs'

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
    updatedTime: any
    updatedBy: string
    createdBy: string
    cratedTime: any
    createadAt: any
    updatedAt: any
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
        updatedTime: values.updatedTime ? values.updatedTime.toISOString() : new Date().toISOString(),
        updatedBy: values.updatedBy,
        createdBy: values.createdBy,
        cratedTime: values.cratedTime ? values.cratedTime.toISOString() : new Date().toISOString(),
        createadAt: values.createadAt ? values.createadAt.toISOString() : new Date().toISOString(),
        updatedAt: values.updatedAt ? values.updatedAt.toISOString() : new Date().toISOString(),
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
      <Card style={{ width: 800, maxHeight: '90vh', overflowY: 'auto' }}>
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
            roles: ["user"],
            updatedTime: dayjs(),
            updatedBy: "System",
            createdBy: "System",
            cratedTime: dayjs(),
            createadAt: dayjs(),
            updatedAt: dayjs(),
            isDeleted: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ad"
                name="firstName"
                rules={[{ required: true, message: 'Lütfen adınızı girin' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Adınız" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Soyad"
                name="lastName"
                rules={[{ required: true, message: 'Lütfen soyadınızı girin' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Soyadınız" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                    { value: "customer", label: "Customer" }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                label="Şifre Tekrar"
                name="confirmPassword"
                rules={[{ required: true, message: 'Lütfen şifrenizi tekrar girin' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Güncelleyen"
                name="updatedBy"
                rules={[{ required: true, message: 'Güncelleyen bilgisi gerekli' }]}
              >
                <Input placeholder="System" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Oluşturan"
                name="createdBy"
                rules={[{ required: true, message: 'Oluşturan bilgisi gerekli' }]}
              >
                <Input placeholder="System" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Güncelleme Zamanı"
                name="updatedTime"
                rules={[{ required: true, message: 'Güncelleme zamanı gerekli' }]}
              >
                <DatePicker 
                  showTime 
                  placeholder="Tarih ve saat seçin"
                  size="large"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Oluşturma Zamanı"
                name="cratedTime"
                rules={[{ required: true, message: 'Oluşturma zamanı gerekli' }]}
              >
                <DatePicker 
                  showTime 
                  placeholder="Tarih ve saat seçin"
                  size="large"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Oluşturulma Tarihi"
                name="createadAt"
                rules={[{ required: true, message: 'Oluşturulma tarihi gerekli' }]}
              >
                <DatePicker 
                  showTime 
                  placeholder="Tarih ve saat seçin"
                  size="large"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Güncellenme Tarihi"
                name="updatedAt"
                rules={[{ required: true, message: 'Güncellenme tarihi gerekli' }]}
              >
                <DatePicker 
                  showTime 
                  placeholder="Tarih ve saat seçin"
                  size="large"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Silinmiş mi?"
                name="isDeleted"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </Col>
          </Row>

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
