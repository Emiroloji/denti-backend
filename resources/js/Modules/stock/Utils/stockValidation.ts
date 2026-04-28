// src/modules/stock/Utils/stockValidation.ts

import { Rule } from 'antd/es/form'

export const STOCK_VALIDATION_RULES: Record<string, Rule[]> = {
  name: [
    { required: true, message: 'Ürün adı gereklidir!' },
    { min: 2, message: 'Ürün adı en az 2 karakter olmalıdır!' }
  ],
  unit: [{ required: true, message: 'Birim seçimi gereklidir!' }],
  category: [{ required: true, message: 'Kategori seçimi gereklidir!' }],
  sub_unit_name: [{ required: true, message: 'Alt birim adı gereklidir!' }],
  sub_unit_multiplier: [{ required: true, message: 'Çarpan gereklidir!' }],
  current_stock: [{ required: true, message: 'Mevcut stok gereklidir!' }],
  min_stock_level: [{ required: true, message: 'Minimum stok gereklidir!' }],
  critical_stock_level: [{ required: true, message: 'Kritik stok gereklidir!' }],
  purchase_price: [{ required: true, message: 'Alış fiyatı gereklidir!' }],
  currency: [{ required: true, message: 'Para birimi seçimi gereklidir!' }],
  supplier_id: [{ required: true, message: 'Tedarikçi seçimi gereklidir!' }],
  clinic_id: [{ required: true, message: 'Klinik seçimi gereklidir!' }],
  purchase_date: [{ required: true, message: 'Alış tarihi gereklidir!' }]
}
