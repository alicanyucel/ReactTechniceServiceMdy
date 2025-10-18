import React, { useState } from 'react'
import { Button, Card, DatePicker, Flex, Form, Input, Modal, Select, Space, TimePicker, Tabs, Switch, message, notification } from 'antd'
import dayjs from 'dayjs'
import type { CreateProductPayload } from '../types/product'
import { createProduct } from '../services/products'

const Devices: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'form'|'json'>('form')
  const [form] = Form.useForm<CreateProductPayload>()
  const [rawJson, setRawJson] = useState('')
  const [loading, setLoading] = useState(false)

  const exampleValues: Partial<CreateProductPayload> = {
    brand: 'Apple',
    model: 'iPhone 14',
    serialNumber: 'SN-123456789',
    description: 'Ekran kırık, batarya zayıf',
    customerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    productType: 0,
    updatedTime: dayjs().format('HH:mm:ss'),
    updatedBy: 'admin',
    createdBy: 'admin',
    cratedTime: dayjs().format('HH:mm:ss'),
    createadAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
    isDeleted: false,
  }

  const onOpen = () => {
    setActiveTab('form')
    form.setFieldsValue(exampleValues as any)
    setRawJson(JSON.stringify(exampleValues, null, 2))
    setOpen(true)
  }

  const onSave = async () => {
    try {
      const isRaw = activeTab === 'json'
      if (isRaw) {
        let body: any
        try { body = JSON.parse(rawJson || '{}') } catch { message.error('Geçersiz JSON'); return }
        setLoading(true)
        await createProduct(body)
        message.success('Cihaz oluşturuldu')
        setOpen(false)
        form.resetFields()
        setRawJson('')
        return
      }
      const values = await form.validateFields()
      const payload: CreateProductPayload = {
        ...values,
        productType: typeof values.productType === 'number' ? values.productType : Number(values.productType || 0),
        updatedTime: values?.updatedTime ? dayjs(values.updatedTime).format('HH:mm:ss') : dayjs().format('HH:mm:ss'),
        cratedTime: values?.cratedTime ? dayjs(values.cratedTime).format('HH:mm:ss') : dayjs().format('HH:mm:ss'),
        createadAt: values?.createadAt ? dayjs(values.createadAt).toISOString() : dayjs().toISOString(),
        updatedAt: values?.updatedAt ? dayjs(values.updatedAt).toISOString() : dayjs().toISOString(),
        isDeleted: typeof values.isDeleted === 'boolean' ? values.isDeleted : false,
      }
      setLoading(true)
      await createProduct(payload)
      message.success('Cihaz oluşturuldu')
      setOpen(false)
      form.resetFields()
    } catch (e: any) {
      if (e?.errorFields) return
      const lines: string[] = Array.isArray(e?.errors) ? e.errors : []
      if (lines.length) {
        notification.error({
          message: 'Cihaz oluşturma hatası',
          description: (<ul style={{ paddingLeft: 18 }}>{lines.slice(0,6).map((l,i)=>(<li key={i}>{l}</li>))}</ul>),
        })
      } else {
        message.error(e?.message || 'Cihaz oluşturulamadı')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Card
        title="Cihazlar"
        extra={<Space><Button type="primary" onClick={onOpen}>Yeni Cihaz</Button></Space>}
      >
        <p>Cihaz yönetimi burada olacak.</p>
      </Card>

      <Modal
        title="Yeni Cihaz"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)} disabled={loading}>İptal</Button>,
          <Button key="save" type="primary" onClick={onSave} loading={loading}>Kaydet</Button>,
        ]}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'form'|'json')} items={[
          { key: 'form', label: 'Form', children: (
            <Form form={form} layout="vertical" preserve={false}>
              <Flex gap={12}>
                <Form.Item name="brand" label="Marka" style={{ flex: 1 }} rules={[{ required: true, message: 'Marka zorunludur' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="model" label="Model" style={{ flex: 1 }} rules={[{ required: true, message: 'Model zorunludur' }]}>
                  <Input />
                </Form.Item>
              </Flex>
              <Flex gap={12}>
                <Form.Item name="serialNumber" label="Seri No" style={{ flex: 1 }} rules={[{ required: true, message: 'Seri No zorunludur' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="productType" label="Ürün Türü" style={{ flex: 1 }} rules={[{ required: true, message: 'Ürün türü zorunludur' }]}>
                  <Select
                    options={[
                      { label: 'Telefon', value: 0 },
                      { label: 'Bilgisayar', value: 1 },
                      { label: 'Tablet', value: 2 },
                      { label: 'Diğer', value: 3 },
                    ]}
                  />
                </Form.Item>
              </Flex>
              <Form.Item name="description" label="Açıklama">
                <Input />
              </Form.Item>
              <Form.Item name="customerId" label="Müşteri ID" rules={[{ required: true, message: 'Müşteri ID zorunludur (GUID)' }]}>
                <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
              </Form.Item>
              <Flex gap={12}>
                <Form.Item name="cratedTime" label="Oluşturma Saati" style={{ flex: 1 }} rules={[{ required: true, message: 'Oluşturma saati zorunludur' }]}>
                  <TimePicker style={{ width: '100%' }} format="HH:mm:ss" />
                </Form.Item>
                <Form.Item name="updatedTime" label="Güncelleme Saati" style={{ flex: 1 }} rules={[{ required: true, message: 'Güncelleme saati zorunludur' }]}>
                  <TimePicker style={{ width: '100%' }} format="HH:mm:ss" />
                </Form.Item>
              </Flex>
              <Flex gap={12}>
                <Form.Item name="createadAt" label="Oluşturma Tarihi" style={{ flex: 1 }} rules={[{ required: true, message: 'Oluşturma tarihi zorunludur' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="updatedAt" label="Güncelleme Tarihi" style={{ flex: 1 }} rules={[{ required: true, message: 'Güncelleme tarihi zorunludur' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Flex>
              <Flex gap={12}>
                <Form.Item name="createdBy" label="Oluşturan" style={{ flex: 1 }} rules={[{ required: true, message: 'Oluşturan zorunludur' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="updatedBy" label="Güncelleyen" style={{ flex: 1 }} rules={[{ required: true, message: 'Güncelleyen zorunludur' }]}>
                  <Input />
                </Form.Item>
              </Flex>
              <Form.Item name="isDeleted" label="Silindi" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          )},
          { key: 'json', label: 'JSON', children: (
            <div>
              <Input.TextArea value={rawJson} onChange={(e) => setRawJson(e.target.value)} autoSize={{ minRows: 12 }} />
            </div>
          )}
        ]} />
      </Modal>
    </div>
  )
}

export default Devices