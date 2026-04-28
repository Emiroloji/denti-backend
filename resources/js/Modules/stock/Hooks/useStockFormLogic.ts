import { useEffect } from 'react'
import { Form, message } from 'antd'
import { useProducts } from './useStocks'
import { useCategories } from '../../category/Hooks/useCategories'
import { Product as Stock } from '../Types/stock.types'
import { useAuth } from '@/Modules/auth/Hooks/useAuth'

export const useStockFormLogic = ({ editingStock, onSuccess }: { editingStock?: any | null, onSuccess?: () => void }) => {
  const { user } = useAuth()
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts()

  const handleSubmit = async (values: any) => {
    try {
      if (editingStock) {
        await updateProduct({
          id: editingStock.id,
          data: values
        })
      } else {
        await createProduct({
          ...values,
          company_id: user?.company_id || 1
        })
      }
      onSuccess?.()
    } catch (error) {
      console.error('İşlem başarısız:', error)
    }
  }

  return {
    handleSubmit,
    isCreating,
    isUpdating
  }
}
