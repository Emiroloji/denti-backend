import React from 'react'
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  Button, 
  Row, 
  Col,
  Divider
} from 'antd'
import { 
  PlusOutlined, 
  SaveOutlined
} from '@ant-design/icons'
import { Product as Stock } from '../Types/stock.types'
import { useStockFormLogic } from '../Hooks/useStockFormLogic'
import { UNIT_OPTIONS } from '../constants/stockConstants'

const { Option } = Select
const { TextArea } = Input

interface ProductFormProps {
  product?: Stock
  onSuccess?: () => void
  onCancel?: () => void
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSuccess, 
  onCancel 
}) => {
  const {
    form,
    handleFinish,
    loading,
    categories,
    isCategoriesLoading
  } = useStockFormLogic(product, onSuccess)

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={product || { unit: 'adet', is_active: true, min_stock_level: 10, critical_stock_level: 5 }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Ürün Adı"
            name="name"
            rules={[{ required: true, message: 'Ürün adı gereklidir' }]}
          >
            <Input placeholder="Ürün adını girin" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="SKU / Kod"
            name="sku"
          >
            <Input placeholder="Ürün kodu" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Kategori"
            name="category"
          >
            <Select 
              placeholder="Kategori seçin"
              loading={isCategoriesLoading}
            >
              {(categories ?? []).map(cat => (
                <Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Marka"
            name="brand"
          >
            <Input placeholder="Marka adı" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Açıklama"
        name="description"
      >
        <TextArea rows={3} placeholder="Ürün açıklaması (opsiyonel)" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Birim"
            name="unit"
            rules={[{ required: true }]}
          >
            <Select placeholder="Birim seçin">
              {UNIT_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Min. Stok Seviyesi"
            name="min_stock_level"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Kritik Stok Seviyesi"
            name="critical_stock_level"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Aktif mi?"
        name="is_active"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>İptal</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {product ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
