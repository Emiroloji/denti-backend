// src/modules/stock/Hooks/useStockTableLogic.ts

import { useState } from 'react'
import { Stock } from '../Types/stock.types'

interface UseStockTableLogicProps {
  onDelete: (id: number) => void
  onSoftDelete: (id: number) => void
  onHardDelete: (id: number) => void
  onReactivate: (id: number) => void
}

export const useStockTableLogic = ({
  onDelete,
  onSoftDelete,
  onHardDelete,
  onReactivate
}: UseStockTableLogicProps) => {
  const [advancedModalStock, setAdvancedModalStock] = useState<Stock | null>(null)
  const [deleteStockId, setDeleteStockId] = useState<number | null>(null)

  const getStockStatus = (record: Stock) => {
    if (record.status) {
      if (record.status === 'deleted') return { type: 'deleted', text: '🗑️ Silindi', color: 'red' }
      if (record.status === 'inactive') return { type: 'inactive', text: '⏸️ Pasif', color: 'orange' }
      if (record.status === 'active') return { type: 'active', text: '✅ Aktif', color: 'green' }
    }

    if (record.is_active === false) {
      return { type: 'inactive', text: '⏸️ Pasif', color: 'orange' }
    }
    
    return { type: 'active', text: '✅ Aktif', color: 'green' }
  }

  const handleDeleteConfirm = (id: number) => {
    setDeleteStockId(id)
  }

  const handleAdvancedDelete = (record: Stock) => {
    setAdvancedModalStock(record)
  }

  const handleStandardDelete = () => {
    if (deleteStockId) {
      onDelete(deleteStockId)
      setDeleteStockId(null)
    }
  }

  const handleSoftDeleteAction = async () => {
    if (advancedModalStock) {
      await onSoftDelete(advancedModalStock.id)
      setAdvancedModalStock(null)
    }
  }

  const handleReactivateAction = async () => {
    if (advancedModalStock) {
      await onReactivate(advancedModalStock.id)
      setAdvancedModalStock(null)
    }
  }

  const handleHardDeleteAction = async () => {
    if (advancedModalStock) {
      await onHardDelete(advancedModalStock.id)
      setAdvancedModalStock(null)
    }
  }

  return {
    advancedModalStock,
    setAdvancedModalStock,
    deleteStockId,
    setDeleteStockId,
    getStockStatus,
    handleDeleteConfirm,
    handleAdvancedDelete,
    handleStandardDelete,
    handleSoftDeleteAction,
    handleReactivateAction,
    handleHardDeleteAction
  }
}
