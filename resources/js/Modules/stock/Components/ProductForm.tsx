// src/modules/stock/Components/ProductForm.tsx

import React, { useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Space, Divider, Switch, DatePicker, Row, Col } from 'antd'
import { Product } from '../Types/stock.types'
import { useStockFormLogic } from '../Hooks/useStockFormLogic'
import { useClinics } from '../../clinics/Hooks/useClinics'
import { useSuppliers } from '../../supplier/Hooks/useSuppliers'
import { useCategories } from '../../category/Hooks/useCategories'
import dayjs from 'dayjs'

interface ProductFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialValues?: Product | null
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel, initialValues }) => {
  const [form] = Form.useForm()
  const { clinics, isLoading: isClinicsLoading } = useClinics()
  const { suppliers, isLoading: isSuppliersLoading } = useSuppliers()
  const { categories, isLoading: isCategoriesLoading } = useCategories()
  
  const { handleSubmit, isCreating, isUpdating } = useStockFormLogic({ 
    editingStock: initialValues, 
    onSuccess 
  })

  const hasExpiry = Form.useWatch('has_expiration_date', form)

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  const onFinish = async (values: any) => {
    // Date formatting
    if (values.expiry_date && typeof values.expiry_date !== 'string') {
      values.expiry_date = values.expiry_date.format('YYYY-MM-DD')
    }
    if (values.purchase_date && typeof values.purchase_date !== 'string') {
      values.purchase_date = values.purchase_date.format('YYYY-MM-DD')
    }
    await handleSubmit(values)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        unit: 'adet',
        min_stock_level: 10,
        critical_stock_level: 5,
        is_active: true,
        has_expiration_date: false,
        initial_stock: 0,
        currency: 'TRY',
        purchase_date: dayjs()
      }}
    >
      <Divider orientation="left">Ürün Temel Bilgileri</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Ürün Adı"
            rules={[{ required: true, message: 'Lütfen ürün adını giriniz' }]}
          >
            <Input placeholder="Örn: Latex Eldiven (M)" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="sku" label="SKU / Barkod">
            <Input placeholder="ELD-001" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="brand" label="Marka">
            <Input placeholder="Örn: DentiMaster" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="unit" label="Birim" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="adet">Adet</Select.Option>
              <Select.Option value="kutu">Kutu</Select.Option>
              <Select.Option value="paket">Paket</Select.Option>
              <Select.Option value="litre">Litre</Select.Option>
              <Select.Option value="gram">Gram</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="category" label="Kategori">
            <Select loading={isCategoriesLoading} placeholder="Seçiniz">
              {categories?.map(cat => (
                <Select.Option key={cat.id} value={cat.name}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item 
            name="has_expiration_date" 
            label="SKT Takibi?" 
            valuePropName="checked"
          >
            <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Açıklama">
        <Input.TextArea rows={1} placeholder="Ürün hakkında kısa bilgi..." />
      </Form.Item>

      {!initialValues && (
        <>
          <Divider orientation="left">Stok & Klinik Detayları</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="clinic_id" 
                label="Giriş Yapılacak Klinik"
                rules={[{ required: true, message: 'Lütfen klinik seçiniz' }]}
              >
                <Select loading={isClinicsLoading} placeholder="Klinik seçin">
                  {clinics?.map(clinic => (
                    <Select.Option key={clinic.id} value={clinic.id}>{clinic.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="supplier_id" 
                label="Tedarikçi"
                rules={[{ required: true, message: 'Lütfen tedarikçi seçiniz' }]}
              >
                <Select loading={isSuppliersLoading} placeholder="Tedarikçi seçin">
                  {suppliers?.map(s => (
                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="storage_location" label="Depolama Konumu (Raf vb.)">
                <Input placeholder="A-1 Rafı" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item 
                name="initial_stock" 
                label="Miktar"
                rules={[{ required: true, message: 'Lütfen miktar giriniz' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="purchase_date" label="Alış Tarihi">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="purchase_price" label="Birim Alış Fiyatı">
                <InputNumber min={0} style={{ width: '100%' }} precision={2} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="Para Birimi">
                <Select>
                  <Select.Option value="TRY">₺ (TL)</Select.Option>
                  <Select.Option value="USD">$ (USD)</Select.Option>
                  <Select.Option value="EUR">€ (EUR)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {hasExpiry && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="expiry_date" 
                  label="Son Kullanma Tarihi"
                  rules={[{ required: true, message: 'SKT takibi olan ürünlerde tarih zorunludur' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </>
      )}

      <Divider orientation="left">Alarm Seviyeleri</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="min_stock_level"
            label="Sarı Alarm (Min)"
            tooltip="Bu seviyenin altına düştüğünde sarı uyarı verilir."
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="critical_stock_level"
            label="Kırmızı Alarm (Kritik)"
            tooltip="Bu seviyenin altına düştüğünde kırmızı uyarı verilir."
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={onCancel}>İptal</Button>
          <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} size="large">
            {initialValues ? 'Değişiklikleri Kaydet' : 'Ürünü ve Stoku Kaydet'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
