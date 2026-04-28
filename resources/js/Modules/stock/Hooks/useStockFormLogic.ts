// src/modules/stock/Hooks/useStockFormLogic.ts

import { useEffect } from 'react'
import { Form, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useStocks } from './useStocks'
import { useSuppliers } from '../../supplier/Hooks/useSuppliers'
import { useClinics } from '../../clinics/Hooks/useClinics'
import { useCategories } from '../../category/Hooks/useCategories'
import { CreateStockRequest, Stock } from '../Types/stock.types'

export interface StockFormValues {
  name: string
  description?: string
  brand?: string
  unit: string
  category: string
  current_stock: number
  current_sub_stock?: number
  min_stock_level: number
  critical_stock_level: number
  yellow_alert_level?: number
  red_alert_level?: number
  purchase_price: number
  currency?: string
  supplier_id: number
  clinic_id: number
  purchase_date: Dayjs | null
  expiry_date?: Dayjs | null
  track_expiry?: boolean
  track_batch?: boolean
  storage_location?: string
  is_active?: boolean
  has_sub_unit?: boolean
  sub_unit_name?: string
  sub_unit_multiplier?: number
}

export const useStockFormLogic = (stock?: Stock, onSuccess?: () => void) => {
  const [form] = Form.useForm<StockFormValues>()
  const { createStock, updateStock, isCreating, isUpdating } = useStocks({})
  const { suppliers, isLoading: isSuppliersLoading } = useSuppliers()
  const { clinics, isLoading: isClinicsLoading } = useClinics()
  const { categories, isLoading: isCategoriesLoading } = useCategories()

  useEffect(() => {
    if (stock) {
      const multiplier = (stock.has_sub_unit && stock.sub_unit_multiplier) ? stock.sub_unit_multiplier : 1
      form.setFieldsValue({
        ...stock,
        purchase_date: stock.purchase_date ? dayjs(stock.purchase_date) : null,
        expiry_date: stock.expiry_date ? dayjs(stock.expiry_date) : null,
        // UI'da kutu bazlı gösterim için multiplier'a bölüyoruz
        min_stock_level: stock.min_stock_level / multiplier,
        critical_stock_level: stock.critical_stock_level / multiplier,
        yellow_alert_level: stock.yellow_alert_level ? (stock.yellow_alert_level / multiplier) : undefined,
        red_alert_level: stock.red_alert_level ? (stock.red_alert_level / multiplier) : undefined,
      })
    } else {
      form.setFieldsValue({
        currency: 'TRY',
        is_active: true,
        unit: 'adet',
        track_expiry: true,
        track_batch: false,
        current_stock: 0,
        min_stock_level: 10,
        critical_stock_level: 5,
        has_sub_unit: false
      })
    }
  }, [stock, form])

  const handleFinish = async (values: StockFormValues) => {
    try {
      const multiplier = (values.has_sub_unit && values.sub_unit_multiplier) ? values.sub_unit_multiplier : 1

      const formData: CreateStockRequest = {
        ...values,
        current_sub_stock: values.has_sub_unit ? (values.current_sub_stock || 0) : 0,
        min_stock_level: values.min_stock_level * multiplier,
        critical_stock_level: values.critical_stock_level * multiplier,
        yellow_alert_level: (values.yellow_alert_level || values.min_stock_level) * multiplier,
        red_alert_level: (values.red_alert_level || values.critical_stock_level) * multiplier,
        purchase_date: values.purchase_date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
        expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
        sub_unit_name: values.has_sub_unit ? values.sub_unit_name : undefined,
        sub_unit_multiplier: values.has_sub_unit ? values.sub_unit_multiplier : undefined
      }

      if (stock) {
        await updateStock({ id: stock.id, data: formData })
        message.success('Stok başarıyla güncellendi!')
      } else {
        await createStock(formData)
        message.success('Stok başarıyla oluşturuldu!')
        form.resetFields()
      }
      onSuccess?.()
    } catch (error) {
      console.error('❌ Stok işlemi başarısız:', error)
      message.error('İşlem sırasında hata oluştu!')
    }
  }

  return {
    form,
    handleFinish,
    loading: isCreating || isUpdating,
    suppliers,
    isSuppliersLoading,
    clinics,
    isClinicsLoading,
    categories,
    isCategoriesLoading: isCategoriesLoading
  }
}
