// src/modules/stock/Components/StockForm.tsx

import React from 'react'
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
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
import { router } from '@inertiajs/react'
import { Stock } from '../Types/stock.types'
import { useStockFormLogic } from '../Hooks/useStockFormLogic'
import { UNIT_OPTIONS, CURRENCY_OPTIONS } from '../constants/stockConstants'
import { STOCK_VALIDATION_RULES } from '../Utils/stockValidation'

const { Option } = Select
const { TextArea } = Input

interface StockFormProps {
  stock?: Stock
  onSuccess?: () => void
  onCancel?: () => void
}

export const StockForm: React.FC<StockFormProps> = ({ 
  stock, 
  onSuccess, 
  onCancel 
}) => {
  
  const {
    form,
    handleFinish,
    loading,
    suppliers,
    isSuppliersLoading,
    clinics,
    isClinicsLoading,
    categories,
    isCategoriesLoading
  } = useStockFormLogic(stock, onSuccess)

  const hasSubUnit = Form.useWatch('has_sub_unit', form)
  const trackExpiry = Form.useWatch('track_expiry', form)

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Ürün Adı"
            name="name"
            rules={STOCK_VALIDATION_RULES.name}
          >
            <Input placeholder="Ürün adını girin" />
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
        <TextArea 
          rows={3} 
          placeholder="Ürün açıklaması (opsiyonel)" 
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Ana Birim (Kutu, Paket vb.)"
            name="unit"
            rules={STOCK_VALIDATION_RULES.unit}
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

        <Col span={16}>
          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Kategori</span>
                <Button type="link" size="small" onClick={() => router.visit('/stock-categories')} style={{ padding: 0 }}>Yönet</Button>
              </div>
            }
            name="category"
            rules={STOCK_VALIDATION_RULES.category}
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
      </Row>

      <Divider orientation="left">Stok Miktarları</Divider>

      <Row gutter={16} align="middle">
        <Col span={8}>
          <Form.Item
            label="Alt Birim (Paket İçi Ürün) Var mı?"
            name="has_sub_unit"
            valuePropName="checked"
            tooltip="Bu stok kendi içinde daha küçük birimlere bölünerek kullanılıyorsa işaretleyin (Örn: 1 Kutunun içinde 20 Tüp olması)"
          >
            <Switch checkedChildren="Var" unCheckedChildren="Yok" />
          </Form.Item>
        </Col>

        {hasSubUnit && (
          <>
            <Col span={8}>
              <Form.Item
                label="İçerik Birimi (Adet, Tüp, Doz vb.)"
                name="sub_unit_name"
                rules={STOCK_VALIDATION_RULES.sub_unit_name}
              >
                <Input placeholder="Tüp, Doz, Adet vb." />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Çarpan (1 Ana Birim = Kaç İçerik Birimi?)"
                name="sub_unit_multiplier"
                rules={STOCK_VALIDATION_RULES.sub_unit_multiplier}
              >
                <InputNumber min={2} style={{ width: '100%' }} placeholder="20" />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={hasSubUnit ? 6 : 8}>
          <Form.Item
            label={`Mevcut Stok ${hasSubUnit ? '(Kapalı Paket/Kutu)' : ''}`}
            name="current_stock"
            rules={STOCK_VALIDATION_RULES.current_stock}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>
        </Col>

        {hasSubUnit && (
          <Col span={6}>
            <Form.Item
              label={`Açık Paketten Kalan (${form.getFieldValue('sub_unit_name') || 'İçerik'})`}
              name="current_sub_stock"
              tooltip="Şu an halihazırda açılmış ve içinden bir miktar kullanılmış olan ana birimin içindeki kalan miktar."
            >
              <InputNumber 
                min={0}
                max={(form.getFieldValue('sub_unit_multiplier') || 2) - 1}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        )}

        <Col span={hasSubUnit ? 6 : 8}>
          <Form.Item
            label="Minimum Stok"
            name="min_stock_level"
            rules={STOCK_VALIDATION_RULES.min_stock_level}
            tooltip={hasSubUnit ? "Bu değer Toplam Alt Birim cinsinden takip edilir." : ""}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="10"
            />
          </Form.Item>
        </Col>

        <Col span={hasSubUnit ? 6 : 8}>
          <Form.Item
            label="Kritik Stok"
            name="critical_stock_level"
            rules={STOCK_VALIDATION_RULES.critical_stock_level}
            tooltip={hasSubUnit ? "Bu değer Toplam Alt Birim cinsinden takip edilir." : ""}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="5"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Fiyat Bilgileri</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Alış Fiyatı"
            name="purchase_price"
            rules={STOCK_VALIDATION_RULES.purchase_price}
          >
            <InputNumber 
              min={0} 
              precision={2}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Para Birimi"
            name="currency"
            rules={STOCK_VALIDATION_RULES.currency}
          >
            <Select>
              {CURRENCY_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Depolama Yeri"
            name="storage_location"
          >
            <Input placeholder="Örn: Buzdolabı A-2" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Takip Ayarları"
            style={{ marginBottom: 8 }}
          >
            <div>
              <Form.Item
                name="track_expiry"
                valuePropName="checked"
                style={{ display: 'inline-block', marginRight: 16 }}
              >
                <Switch /> Son Kullanma Takibi
              </Form.Item>
              
              <Form.Item
                name="track_batch"
                valuePropName="checked"
                style={{ display: 'inline-block' }}
              >
                <Switch /> Lot Takibi
              </Form.Item>
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Tedarik Bilgileri</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tedarikçi"
            name="supplier_id"
            rules={STOCK_VALIDATION_RULES.supplier_id}
          >
            <Select 
              placeholder="Tedarikçi seçin"
              showSearch
              optionFilterProp="children"
              loading={isSuppliersLoading}
              notFoundContent={isSuppliersLoading ? 'Yükleniyor...' : 'Tedarikçi bulunamadı'}
            >
              {(suppliers ?? []).map((supplier) => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Klinik"
            name="clinic_id"
            rules={STOCK_VALIDATION_RULES.clinic_id}
          >
            <Select 
              placeholder="Klinik seçin"
              showSearch
              optionFilterProp="children"
              loading={isClinicsLoading}
              notFoundContent={isClinicsLoading ? 'Yükleniyor...' : 'Klinik bulunamadı'}
            >
              {(clinics ?? []).map((clinic) => (
                <Option key={clinic.id} value={clinic.id}>
                  {clinic.name} ({clinic.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Alış Tarihi"
            name="purchase_date"
            rules={STOCK_VALIDATION_RULES.purchase_date}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Alış tarihini seçin"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Son Kullanma Tarihi"
            name="expiry_date"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Son kullanma tarihi (opsiyonel)"
            />
          </Form.Item>
        </Col>
      </Row>

      {trackExpiry && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="SKT Sarı Alarm (Gün)"
              name="expiry_yellow_days"
              tooltip="Son kullanma tarihine kaç gün kala sarı uyarı verilsin?"
              initialValue={30}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="SKT Kırmızı Alarm (Gün)"
              name="expiry_red_days"
              tooltip="Son kullanma tarihine kaç gün kala kırmızı (kritik) uyarı verilsin?"
              initialValue={15}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Form.Item
        label="Aktif Durumu"
        name="is_active"
        valuePropName="checked"
      >
        <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          İptal
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={stock ? <SaveOutlined /> : <PlusOutlined />}
          loading={loading}
        >
          {stock ? 'Güncelle' : 'Kaydet'}
        </Button>
      </Form.Item>
    </Form>
  )
}
