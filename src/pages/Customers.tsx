import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Flex, Form, Input, Modal, Select, Space, Table, Tag, TimePicker, Switch, Tabs, message, notification } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { createCustomer, fetchCustomers, deleteCustomer } from '../services/customers'
import { CreateCustomerPayload, Customer } from '../types/customer'
import dayjs from 'dayjs'

const Customers: React.FC = () => {
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<CreateCustomerPayload>()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'form'|'json'>('form')
  const [rawJson, setRawJson] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchCustomers()
      if (!Array.isArray(list)) {
        message.warning('API beklenen formatta değil. Liste boş gösteriliyor.')
        setData([])
      } else {
        setData(list)
      }
    } catch (e: any) {
      message.error(e?.message || 'Müşteriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Example payload helpers for quick fill and JSON paste
  const getExampleFormValues = useCallback(() => ({
    name: 'İlayda',
    surname: 'Koç',
    phoneNumber: '+905316789012',
    email: 'ilayda.koc@example.com',
    address: {
      addressLine: 'Yeşil Vadi Sitesi B Blok No:7',
      city: 'Bursa',
      neighborhood: 'Nilüfer',
      district: 'Osmangazi',
      zipCode: '16010',
      country: 'Türkiye',
    },
    customerType: 1,
    updatedTime: dayjs('13:25:00', 'HH:mm:ss'),
    updatedBy: 'admin',
    createdBy: 'ilayda.koc',
    cratedTime: dayjs('08:50:00', 'HH:mm:ss'),
    createadAt: dayjs('2025-10-18T08:50:00.000Z'),
    updatedAt: dayjs('2025-10-18T13:25:00.000Z'),
    isDeleted: false,
  }), [])

  const getExampleRawJson = useCallback(() => JSON.stringify({
    name: 'İlayda',
    surname: 'Koç',
    phoneNumber: '+905316789012',
    email: 'ilayda.koc@example.com',
    address: {
      addressLine: 'Yeşil Vadi Sitesi B Blok No:7',
      city: 'Bursa',
      neighborhood: 'Nilüfer',
      district: 'Osmangazi',
      zipCode: '16010',
      country: 'Türkiye',
    },
    customerType: 1,
    updatedTime: '13:25:00',
    updatedBy: 'admin',
    createdBy: 'ilayda.koc',
    cratedTime: '08:50:00',
    createadAt: '2025-10-18T08:50:00.000Z',
    updatedAt: '2025-10-18T13:25:00.000Z',
    isDeleted: false,
  }, null, 2), [])

  // Auto-fill both modes when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('form')
      ;(form as any).setFieldsValue(getExampleFormValues())
      setRawJson(getExampleRawJson())
    }
  }, [open, form, getExampleFormValues, getExampleRawJson])

  const handleClear = useCallback(() => {
    if (activeTab === 'json') {
      setRawJson('')
    } else {
      form.resetFields()
      // Override initialValues so the form stays visually cleared
      form.setFieldsValue({ customerType: undefined, isDeleted: false })
    }
  }, [activeTab, form])


  const humanize = (k: string) => {
    // Özel durumlar önce
    const titleMap: Record<string, string> = {
      'createdAt': 'Oluşturma Tarihi',
      // Yaygın yazım hataları için eşlemeler (API kaynaklı olabilir)
      'createadAt': 'Oluşturma Tarihi',
      'createadTime': 'Oluşturma Saati',
      'updatedAt': 'Güncelleme Tarihi',
      'createdDate': 'Oluşturma Tarihi',
      'updatedDate': 'Güncelleme Tarihi',
      'created': 'Oluşturma Tarihi',
      'updated': 'Güncelleme Tarihi',
      'createdTime': 'Oluşturma Saati',
      'updatedTime': 'Güncelleme Saati',
      'isDeleted': 'Durum',
      'deleted': 'Durum',
    }
    if (titleMap[k]) return titleMap[k]
    
    // Türkçe camelCase dönüştürme
    return k
      .split('.').join(' · ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (s: string) => s.toUpperCase())
  }

  const turkishTitles: Record<string, string> = {
    'name': 'Ad',
    'surname': 'Soyad',
    'address.addressLine': 'Adres',
    'address.city': 'Şehir',
    'address.district': 'İlçe',
    'address.neighborhood': 'Mahalle',
    'address.zipCode': 'Posta Kodu',
    'address.country': 'Ülke',
    'customerType.name': 'Müşteri Türü',
    'phoneNumber': 'Telefon',
    'email': 'E-posta',
    'createdAt': 'Oluşturma Tarihi',
    'createadAt': 'Oluşturma Tarihi',
    'updatedAt': 'Güncelleme Tarihi',
    'id': 'ID',
    'isDeleted': 'Durum',
    'createdBy': 'Oluşturan',
    'updatedBy': 'Güncelleyen',
    'products': 'Ürünler',
    'updatedTime': 'Güncelleme Saati',
    'createdTime': 'Oluşturma Saati',
    'createadTime': 'Oluşturma Saati',
    'createdDate': 'Oluşturma Tarihi',
    'updatedDate': 'Güncelleme Tarihi',
  }

  const getByPath = (obj: any, pathArr: string[]) => pathArr.reduce((acc, key) => (acc ? acc[key] : undefined), obj)

  const isDateLike = (v: any) => typeof v === 'string' && v.length >= 10 && dayjs(v).isValid()

  const formatTimeOnly = (val: any): string => {
    if (val == null) return '-'
    let s = String(val)
    // Remove milliseconds if any
    if (s.includes('.')) s = s.split('.')[0]
    const parts = s.split(':')
    const hh = (parts[0] || '00').padStart(2, '0')
    const mm = (parts[1] || '00').padStart(2, '0')
    const ss = (parts[2] || '00').padStart(2, '0')
    return `${hh}:${mm}.${ss}`
  }

  const renderValue = (val: any, key?: string) => {
    if (val === null || val === undefined) return '-'
    if (typeof val === 'boolean') return <Tag color={val ? 'green' : 'volcano'}>{val ? 'Evet' : 'Hayır'}</Tag>
    if (typeof val === 'number') return val
    if (Array.isArray(val)) return val.map((x, i) => <Tag key={i}>{String(x)}</Tag>)
    if (isDateLike(val) || (key && /date|time|at/i.test(key))) {
      // String'den milliseconds kısmı kaldır
      let displayVal = String(val)
      if (displayVal.includes('.')) {
        displayVal = displayVal.split('.')[0] // "10:58:04.6112642" → "10:58:04"
      }

      // "createdTime", "updatedTime" gibi pure time alanları için özel format: HH:mm.ss
      if (key && /time/i.test(key) && !/date|at/i.test(key)) {
        const parts = displayVal.split(':')
        const hh = (parts[0] || '00').padStart(2, '0')
        const mm = (parts[1] || '00').padStart(2, '0')
        const ss = (parts[2] || '00').padStart(2, '0')
        return `${hh}:${mm}.${ss}`
      }

      // Tarih + saat alanları
      const d = dayjs(val)
      return d.isValid() ? d.locale('tr').format('DD MMMM YYYY HH:mm') : String(val)
    }
    if (typeof val === 'object') return <code style={{ whiteSpace: 'pre' }}>{JSON.stringify(val)}</code>
    return String(val)
  }

  const getAllKeys = (items: any[]): string[] => {
    const keys = new Set<string>()
    const walk = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return
      Object.entries(obj).forEach(([k, v]) => {
        const full = prefix ? `${prefix}.${k}` : k
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          walk(v, full)
        } else {
          keys.add(full)
        }
      })
    }
    items.forEach((it) => walk(it))
    return Array.from(keys)
  }

  const preferredOrder = ['id', 'name', 'surname', 'phoneNumber', 'email', 'address.city', 'customerType.name', 'createdAt', 'updatedAt']

  const DEFAULT_SCHEMA: string[] = [
    'name',
    'surname',
    'phoneNumber',
    'email',
    'address.addressLine',
    'address.city',
    'address.neighborhood',
    'address.district',
    'address.zipCode',
    'address.country',
    'customerType.name',
    'updatedTime',
    'createdTime',
    'updatedBy',
    'createdBy',
    'createadAt',
    'updatedAt',
    'isDeleted',
    'id',
  ]

  const columns: ColumnsType<any> = useMemo(() => {
  let keys = (data && data.length > 0) ? getAllKeys(data) : DEFAULT_SCHEMA
  // customerType.value'yi hariç tut
  keys = keys.filter(k => k !== 'customerType.value')

    // order: preferred keys first, then the rest
    const ordered = [
      ...preferredOrder.filter(k => keys.includes(k)),
      ...keys.filter(k => !preferredOrder.includes(k)),
    ]

    const makeTextFilter = (pathArr: string[]) => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Değer filtrele"
            value={selectedKeys[0] as string}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" size="small" onClick={() => confirm()}>Filtrele</Button>
            <Button size="small" onClick={() => { clearFilters?.(); confirm(); }}>Temizle</Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: any) => {
        const raw = getByPath(record, pathArr)
        const str = typeof raw === 'object' ? JSON.stringify(raw) : String(raw ?? '')
        return str.toLowerCase().includes(String(value).toLowerCase())
      },
    })

    const cols = ordered.map((key) => {
      const pathArr = key.split('.')
      let title = turkishTitles[key] || humanize(key)
      // Bu başlıklar turkishTitles map'inde tanımlı
      const baseCol: any = {
        title,
        dataIndex: pathArr,
        ellipsis: true,
        sorter: (a: any, b: any) => {
          const av = getByPath(a, pathArr)
          const bv = getByPath(b, pathArr)
          if (typeof av === 'number' && typeof bv === 'number') return av - bv
          return String(av ?? '').localeCompare(String(bv ?? ''))
        },
        render: (val: any) => renderValue(val, key),
      }

      // Customizations for specific fields
      if (key === 'name') {
        baseCol.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Ad filtrele"
              value={selectedKeys[0] as string}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" size="small" onClick={() => confirm()}>Filtrele</Button>
              <Button size="small" onClick={() => { clearFilters?.(); confirm(); }}>Temizle</Button>
            </Space>
          </div>
        )
        baseCol.onFilter = (value: any, record: any) => String(getByPath(record, pathArr) ?? '').toLowerCase().includes(String(value).toLowerCase())
      }
      // CustomerType özel durum: API artık obje dönüyor { name, value }
      if (key === 'customerType.name') {
        baseCol.render = (_: any, record: Customer) => {
          const name = getByPath(record, ['customerType','name'])
          return <Tag color="blue">{name || '-'}</Tag>
        }
      }
      if (/isDeleted/i.test(key)) {
        baseCol.render = (val: any) => <Tag color={val ? 'volcano' : 'green'}>{val ? 'Silinmiş' : 'Aktif'}</Tag>
      }
      // Force time-only formatting for createdTime/createadTime/updatedTime (support dot or underscore path)
      if (/(^|[._])createad?time$/i.test(key) || /(^|[._])updatedtime$/i.test(key)) {
        baseCol.render = (val: any) => formatTimeOnly(val)
      } else if (/createdAt|updatedAt|time/i.test(key)) {
        baseCol.render = (val: any) => renderValue(val, key)
      }

      // Final safeguard by title mapping
      if (title === 'Oluşturma Saati' || title === 'Güncelleme Saati') {
        baseCol.render = (val: any) => formatTimeOnly(val)
      }

      // Generic text filter for all columns that don't already define filters
      if (!baseCol.filters && !baseCol.filterDropdown) {
        const tf = makeTextFilter(pathArr)
        baseCol.filterDropdown = tf.filterDropdown
        baseCol.onFilter = tf.onFilter
      }

      return baseCol
    })

    // Add action column at the end
    cols.push({
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Customer) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>Güncelle</Button>
          <Button size="small" danger onClick={() => onDelete(String(record.id))}>Sil</Button>
        </Space>
      ),
    })

    return cols
  }, [data])

  const onCreate = async () => {
    try {
      const isRaw = activeTab === 'json'
      // Raw JSON mode: send as-is
      if (isRaw) {
        let body: any
        try {
          body = JSON.parse(rawJson || '{}')
        } catch (err) {
          message.error('Geçersiz JSON. Lütfen kontrol edin.')
          return
        }
        setLoading(true)
        await createCustomer(body as any)
        message.success('Müşteri oluşturuldu')
        await load()
        setOpen(false)
        form.resetFields()
        setRawJson('')
        return
      }

      const values = await form.validateFields()
      // Normalize address to always include all fields
      const addr = values?.address || {}
      const safeAddress = {
        addressLine: addr.addressLine ?? '',
        city: addr.city ?? '',
        neighborhood: addr.neighborhood ?? '',
        district: addr.district ?? '',
        zipCode: addr.zipCode ?? '',
        country: addr.country ?? '',
      }
      // Transform date/time fields to API expectations
      const payload: CreateCustomerPayload = {
        ...values,
        address: safeAddress,
        // time-only fields as HH:mm:ss
        updatedTime: values?.updatedTime ? dayjs(values.updatedTime).format('HH:mm:ss') : undefined,
        cratedTime: values?.cratedTime ? dayjs(values.cratedTime).format('HH:mm:ss') : undefined,
        // date-time fields as ISO
        createadAt: values?.createadAt ? dayjs(values.createadAt).toISOString() : undefined,
        updatedAt: values?.updatedAt ? dayjs(values.updatedAt).toISOString() : undefined,
        isDeleted: typeof values.isDeleted === 'boolean' ? values.isDeleted : false,
      }
      setLoading(true)
      await createCustomer(payload)
      message.success('Müşteri oluşturuldu')
      // Sunucudan taze liste çek
      await load()
      setOpen(false)
      form.resetFields()
    } catch (e: any) {
      if (e?.errorFields) return // form validasyon hatası
      // Eğer servis ProblemDetails/ModelState detayları verdiyse göster
      const lines: string[] = Array.isArray(e?.errors) ? e.errors : []
      if (lines.length) {
        notification.error({
          message: 'Form doğrulama hatası',
          description: (
            <div>
              <div style={{ marginBottom: 8 }}>{e?.message || 'Geçersiz istek (400). Lütfen alanları kontrol edin.'}</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {lines.slice(0, 6).map((l, i) => (<li key={i}>{l}</li>))}
                {lines.length > 6 && <li>… {lines.length - 6} daha</li>}
              </ul>
            </div>
          ),
          placement: 'topRight',
          duration: 6,
        })
      } else {
        message.error(e?.message || 'Müşteri oluşturulamadı')
      }
    } finally {
      setLoading(false)
    }
  }

  const onDelete = (id: string) => {
    setDeleteId(id)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCustomer(deleteId)
      message.success('✓ Müşteri başarıyla silindi!')
      setDeleteModalOpen(false)
      setDeleteId(null)
      await load()
    } catch (err: any) {
      message.error(err.message || 'Müşteri silinirken hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const onEdit = (_record: Customer) => {
    message.info(`Müşteri güncelleme özelliği yakında gelecek`)
  }

  // Kullanılmayan uyarı giderildi - actionColumn columns içinde zaten kullanılıyor

  // Action column tanımı (columns array'inde kullanılıyor)
  // Bu tanım, columns useMemo hook'unun içinde şu şekilde kullanılıyor:
  // cols.push({ title: 'İşlemler', key: 'actions', width: 150, fixed: 'right', render: ... })

  const tableProps: TableProps<any> = {
    rowKey: (r: any) => String(r.id ?? `${r.name}-${r.surname}-${Math.random()}`),
    loading,
    dataSource: data,
    columns,
    scroll: { x: 'max-content' },
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      position: ['bottomCenter'],
    },
  }

  return (
    <Flex vertical gap={12}>
      <Card
        title="Müşteriler"
        extra={
          <Space>
            <Button onClick={load}>Yenile</Button>
            <Button type="primary" onClick={() => setOpen(true)}>Yeni Müşteri</Button>
          </Space>
        }
      >
        <Table {...tableProps} />
      </Card>

      <Modal
        title="Yeni Müşteri"
        open={open}
        afterOpenChange={(vis) => {
          if (vis) {
            setActiveTab('form')
            // Apply examples to both modes to ensure immediate visibility
            ;(form as any).setFieldsValue(getExampleFormValues())
            setRawJson(getExampleRawJson())
          }
        }}
        footer={[
          <Button key="clear" onClick={handleClear} disabled={loading} style={{ marginRight: 'auto' }}>Temizle</Button>,
          <Button key="cancel" onClick={() => setOpen(false)} disabled={loading}>İptal</Button>,
          <Button key="save" type="primary" onClick={onCreate} loading={loading}>Kaydet</Button>,
        ]}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'form'|'json')} items={[
          { key: 'form', label: 'Örnek Doldur', children: (
            <Form form={form} layout="vertical" preserve={false} initialValues={{ customerType: 0, isDeleted: false }}>
          <Flex gap={12}>
            <Form.Item
              name="name"
              label="Ad"
              rules={[
                { required: true, message: 'Ad zorunludur' },
                { min: 2, message: 'Ad en az 2 karakter olmalı' },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Ad" />
            </Form.Item>
            <Form.Item
              name="surname"
              label="Soyad"
              rules={[
                { required: true, message: 'Soyad zorunludur' },
                { min: 2, message: 'Soyad en az 2 karakter olmalı' },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Soyad" />
            </Form.Item>
          </Flex>

          <Flex gap={12}>
            <Form.Item
              name="phoneNumber"
              label="Telefon"
              style={{ flex: 1 }}
              rules={[
                { required: true, message: 'Telefon zorunludur' },
                {
                  pattern: /^(\+90\s?)?0?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/,
                  message: 'Geçerli bir GSM numarası girin (örn. 05xx xxx xx xx)'
                }
              ]}
            >
              <Input placeholder="05xx xxx xx xx" />
            </Form.Item>
            <Form.Item name="email" label="E-posta" rules={[{ type: 'email', message: 'Geçerli e-posta girin' }]} style={{ flex: 1 }}>
              <Input placeholder="ornek@firma.com" />
            </Form.Item>
          </Flex>

          <Form.Item name={["address", "addressLine"]} label="Adres Satırı">
            <Input placeholder="Mahalle/Sokak/Cadde ..." />
          </Form.Item>
          <Flex gap={12}>
            <Form.Item name={["address", "city"]} label="Şehir" style={{ flex: 1 }} rules={[{ required: true, message: 'Şehir zorunludur' }]}> 
              <Input placeholder="Şehir" />
            </Form.Item>
            <Form.Item name={["address", "district"]} label="İlçe" style={{ flex: 1 }} rules={[{ required: true, message: 'İlçe zorunludur' }]}> 
              <Input placeholder="İlçe" />
            </Form.Item>
          </Flex>
          <Flex gap={12}>
            <Form.Item name={["address", "neighborhood"]} label="Mahalle" style={{ flex: 1 }}>
              <Input placeholder="Mahalle" />
            </Form.Item>
            <Form.Item name={["address", "zipCode"]} label="Posta Kodu" style={{ flex: 1 }}>
              <Input placeholder="00000" />
            </Form.Item>
          </Flex>
          <Form.Item name={["address", "country"]} label="Ülke" rules={[{ required: true, message: 'Ülke zorunludur' }]}>
            <Input placeholder="Türkiye" />
          </Form.Item>

          <Form.Item name="customerType" label="Müşteri Türü" rules={[{ required: true, message: 'Müşteri türü zorunludur' }]}>
            <Select
              placeholder="Seçiniz"
              options={[
                { label: 'Bireysel', value: 0 },
                { label: 'Kurumsal', value: 1 },
              ]}
            />
          </Form.Item>

          <Form.Item name="isDeleted" label="Silindi" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Flex gap={12}>
            <Form.Item name="updatedBy" label="Güncelleyen" style={{ flex: 1 }} rules={[{ required: true, message: 'Güncelleyen zorunludur' }]}> 
              <Input placeholder="Güncelleyen kullanıcı" />
            </Form.Item>
            <Form.Item name="createdBy" label="Oluşturan" style={{ flex: 1 }} rules={[{ required: true, message: 'Oluşturan zorunludur' }]}> 
              <Input placeholder="Oluşturan kullanıcı" />
            </Form.Item>
          </Flex>

          <Flex gap={12}>
            <Form.Item
              name="updatedTime"
              label="Güncelleme Saati"
              style={{ flex: 1 }}
              dependencies={["cratedTime", "createadAt", "updatedAt"]}
              rules={[
                { required: true, message: 'Güncelleme saati zorunludur' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('cratedTime')
                    if (!value || !start) return Promise.resolve()
                    const createdDate = getFieldValue('createadAt')
                    const updatedDate = getFieldValue('updatedAt')
                    const sameDay = createdDate && updatedDate
                      ? dayjs(updatedDate).isSame(dayjs(createdDate), 'day')
                      : true
                    if (!sameDay) return Promise.resolve()
                    const s = dayjs(start)
                    const v = dayjs(value)
                    const sSec = s.hour() * 3600 + s.minute() * 60 + s.second()
                    const vSec = v.hour() * 3600 + v.minute() * 60 + v.second()
                    if (vSec < sSec) {
                      return Promise.reject(new Error('Güncelleme saati, aynı gün için oluşturma saatinden önce olamaz'))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm:ss" />
            </Form.Item>
            <Form.Item name="cratedTime" label="Oluşturma Saati" style={{ flex: 1 }} rules={[{ required: true, message: 'Oluşturma saati zorunludur' }]}>
              <TimePicker style={{ width: '100%' }} format="HH:mm:ss" />
            </Form.Item>
          </Flex>

          <Flex gap={12}>
            <Form.Item name="createadAt" label="Oluşturma Tarihi" style={{ flex: 1 }} rules={[{ required: true, message: 'Oluşturma tarihi zorunludur' }]}> 
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="updatedAt"
              label="Güncelleme Tarihi"
              style={{ flex: 1 }}
              dependencies={["createadAt"]}
              rules={[
                { required: true, message: 'Güncelleme tarihi zorunludur' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('createadAt')
                    if (!value || !start) return Promise.resolve()
                    const s = dayjs(start)
                    const v = dayjs(value)
                    if (v.isBefore(s)) {
                      return Promise.reject(new Error('Güncelleme tarihi, oluşturma tarihinden önce olamaz'))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Flex>
            </Form>
          )},
          { key: 'json', label: 'Örnek JSON', children: (
            <div>
              <Space style={{ marginBottom: 8 }}>
                <Button size="small" onClick={() => setRawJson(getExampleRawJson())}>Örnek JSON</Button>
                <Button size="small" onClick={() => {
                  const values = form.getFieldsValue(true)
                  const addr = values?.address || {}
                  const safeAddress = {
                    addressLine: addr.addressLine ?? '',
                    city: addr.city ?? '',
                    neighborhood: addr.neighborhood ?? '',
                    district: addr.district ?? '',
                    zipCode: addr.zipCode ?? '',
                    country: addr.country ?? '',
                  }
                  const payload: CreateCustomerPayload = {
                    ...values,
                    address: safeAddress,
                    updatedTime: values?.updatedTime ? dayjs(values.updatedTime).format('HH:mm:ss') : undefined,
                    cratedTime: values?.cratedTime ? dayjs(values.cratedTime).format('HH:mm:ss') : undefined,
                    createadAt: values?.createadAt ? dayjs(values.createadAt).toISOString() : undefined,
                    updatedAt: values?.updatedAt ? dayjs(values.updatedAt).toISOString() : undefined,
                    isDeleted: typeof values.isDeleted === 'boolean' ? values.isDeleted : false,
                  }
                  setRawJson(JSON.stringify(payload, null, 2))
                }}>Formdan JSON</Button>
              </Space>
              <Input.TextArea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                autoSize={{ minRows: 12 }}
                placeholder={"Swagger'da çalışan JSON'ı buraya yapıştırın veya 'Formdan JSON' ile üretin"}
              />
              <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
                Bu sekmede form yok sayılır ve JSON doğrudan API'ye gönderilir.
              </div>
            </div>
          )}
        ]} />
      </Modal>

      <Modal
        title="Müşteri Sil"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalOpen(false)}>
            İptal
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deleting}
            onClick={handleConfirmDelete}
          >
            Evet, Sil
          </Button>,
        ]}
      >
        <p>Bu müşteri kaydını silmek istediğinize emin misiniz?</p>
        <p style={{ color: '#999', fontSize: '12px' }}>Bu işlem geri alınamaz.</p>
      </Modal>
    </Flex>
  )
}

export default Customers