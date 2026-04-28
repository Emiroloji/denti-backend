// src/modules/stock/Components/ProductForm.tsx

import React, { useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Space, Card, Row, Col } from 'antd'
import { Product, CreateProductRequest } from '../Types/stock.types'
import { useStockFormLogic } from '../Hooks/useStockFormLogic'

interface ProductFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialValues?: Product | null
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel, initialValues }) => {
  const [form] = Form.useForm()
  const { handleSubmit, isCreating, isUpdating } = useStockFormLogic({ 
    editingStock: initialValues, 
    onSuccess 
  })

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  const onFinish = async (values: any) => {
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
        is_active: true
      }}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="name"
            label="Ürün Adı"
            rules={[{ required: true, message: 'Lütfen ürün adını giriniz' }]}
          >
            <Input placeholder="Örn: Latex Eldiven (M)" size="large" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="sku"
            label="SKU / Barkod"
          >
            <Input placeholder="Örn: ELD-001" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Kategori"
          >
            <Input placeholder="Örn: Sarf Malzeme" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="brand"
            label="Marka"
          >
            <Input placeholder="Örn: DentiMaster" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="unit"
            label="Birim"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="adet">Adet</Select.Option>
              <Select.Option value="kutu">Kutu</Select.Option>
              <Select.Option value="paket">Paket</Select.Option>
              <Select.Option value="litre">Litre</Select.Option>
              <Select.Option value="gram">Gram</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={1} placeholder="Ürün hakkında kısa bilgi..." />
          </Form.Item>
        </Col>
      </Row>

      <Card size="small" title="Stok Uyarı Seviyeleri" style={{ marginBottom: 24, backgroundColor: '#fafafa' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="min_stock_level"
              label="Düşük Stok Limiti (Sarı)"
              tooltip="Bu seviyenin altına düştüğünde sarı uyarı verilir."
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="critical_stock_level"
              label="Kritik Stok Limiti (Kırmızı)"
              tooltip="Bu seviyenin altına düştüğünde kırmızı uyarı verilir."
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>İptal</Button>
          <Button type="primary" htmlType="submit" loading={isCreating || isUpdating} size="large">
            {initialValues ? 'Güncelle' : 'Ürün Oluştur'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
