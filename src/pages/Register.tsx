import React from 'react'
import { Card, Flex, Typography } from 'antd'

const { Title, Text } = Typography

const Register: React.FC = () => {
  return (
    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
      <Card style={{ width: 480 }}>
        <Title level={3} style={{ marginBottom: 8 }}>Kayıt</Title>
        <Text type="secondary">Bu sayfa örnek amaçlıdır. Kayıt formu burada yer alacaktır.</Text>
      </Card>
    </Flex>
  )
}

export default Register
