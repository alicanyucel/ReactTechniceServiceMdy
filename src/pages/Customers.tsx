import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Flex, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd'
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
      const values = await form.validateFields()
      setLoading(true)
      await createCustomer(values)
      message.success('Müşteri oluşturuldu')
      setOpen(false)
      form.resetFields()
      // Not: Gerçek API'den liste alma olduğunda list tekrar yüklenecek
      setData(prev => [{ ...values, id: Date.now() }, ...prev])
    } catch (e: any) {
      if (e?.errorFields) return // form validasyon hatası
      message.error(e?.message || 'Müşteri oluşturulamadı')
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
        onOk={onCreate}
        onCancel={() => setOpen(false)}
        confirmLoading={loading}
        okText="Kaydet"
        cancelText="İptal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Flex gap={12}>
            <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Zorunlu alan' }]} style={{ flex: 1 }}>
              <Input placeholder="Ad" />
            </Form.Item>
            <Form.Item name="surname" label="Soyad" rules={[{ required: true, message: 'Zorunlu alan' }]} style={{ flex: 1 }}>
              <Input placeholder="Soyad" />
            </Form.Item>
          </Flex>

          <Flex gap={12}>
            <Form.Item name="phoneNumber" label="Telefon" style={{ flex: 1 }}>
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
            <Form.Item name={["address", "city"]} label="Şehir" style={{ flex: 1 }}>
              <Input placeholder="Şehir" />
            </Form.Item>
            <Form.Item name={["address", "district"]} label="İlçe" style={{ flex: 1 }}>
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

          <Form.Item name="customerType" label="Müşteri Türü">
            <Select
              placeholder="Seçiniz"
              options={[
                { label: 'Bireysel', value: 0 },
                { label: 'Kurumsal', value: 1 },
              ]}
            />
          </Form.Item>
        </Form>
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