// src/modules/stock/Components/StockList.tsx

import React, { useState, useCallback, useMemo } from 'react'
import { Card, Form, Typography } from 'antd'
import { useStocks } from '../Hooks/useStocks'
import { Stock, StockFilter, StockAdjustmentRequest, StockUsageRequest } from '../Types/stock.types'

// Component imports
import { StockTable } from './StockTable'
import { StockFilters } from './StockFilters'
import { StockStats } from './StockStats'
import { StockAlerts } from './StockAlerts'
import { StockModals } from './StockModals'
import { StockHistoryModal } from './StockHistoryModal'

import { useAuth } from '@/Modules/auth/Hooks/useAuth'

const { Title } = Typography

export const StockList: React.FC = () => {
  const { user } = useAuth()
  // State management
  const [filters, setFilters] = useState<StockFilter>({})
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false)
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false)
  const [isUseModalVisible, setIsUseModalVisible] = useState(false)
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  
  // Form instances
  const [adjustForm] = Form.useForm()
  const [useForm] = Form.useForm()

  // Hooks
  const { 
    stocks, 
    isLoading, 
    refetch, 
    softDeleteStock,      // ✅ YENİ - Pasif yap
    hardDeleteStock,      // ✅ YENİ - Kalıcı sil
    reactivateStock,      // ✅ YENİ - Aktif et
    deleteStock,          // Standart Akıllı Silme
    adjustStock, 
    useStock: executeStockUsage,
    isAdjusting,
    isUsing,
    isSoftDeleting,       // ✅ YENİ Loading state
    isHardDeleting,       // ✅ YENİ Loading state
    isReactivating        // ✅ YENİ Loading state
  } = useStocks(filters)

  // Silinen ürünleri gizle (Backend silinse bile history için veritabanında tutuyor)
  const activeStocks = useMemo(() => {
    if (!stocks) return []
    return stocks.filter(s => s.status !== 'deleted')
  }, [stocks])

  // Computed data (manual calculations since hooks are disabled)
  const stockStats = useMemo(() => {
    if (!activeStocks) return null
    
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return {
      total_items: activeStocks.length,
      low_stock_items: activeStocks.filter(s => {
        const currentAmount = s.has_sub_unit ? (s.total_base_units || (s.current_stock * (s.sub_unit_multiplier || 1) + (s.current_sub_stock || 0))) : s.current_stock;
        return currentAmount <= s.min_stock_level;
      }).length,
      critical_stock_items: activeStocks.filter(s => {
        const currentAmount = s.has_sub_unit ? (s.total_base_units || (s.current_stock * (s.sub_unit_multiplier || 1) + (s.current_sub_stock || 0))) : s.current_stock;
        return currentAmount <= s.critical_stock_level;
      }).length,
      expiring_items: activeStocks.filter(s => {
        if (!s.expiry_date) return false
        const expiryDate = new Date(s.expiry_date)
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today
      }).length,
      total_value: activeStocks.reduce((sum, s) => sum + (s.purchase_price * s.current_stock), 0)
    }
  }, [activeStocks])

  const lowStockItems = useMemo(() => {
    if (!activeStocks) return []
    return activeStocks.filter(s => {
      const currentAmount = s.has_sub_unit ? (s.total_base_units || (s.current_stock * (s.sub_unit_multiplier || 1) + (s.current_sub_stock || 0))) : s.current_stock;
      return currentAmount <= s.min_stock_level;
    })
  }, [activeStocks])

  const criticalStockItems = useMemo(() => {
    if (!activeStocks) return []
    return activeStocks.filter(s => {
      const currentAmount = s.has_sub_unit ? (s.total_base_units || (s.current_stock * (s.sub_unit_multiplier || 1) + (s.current_sub_stock || 0))) : s.current_stock;
      return currentAmount <= s.critical_stock_level;
    })
  }, [activeStocks])

  const expiringItems = useMemo(() => {
    if (!activeStocks) return []
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    
    return activeStocks.filter(s => {
      if (!s.expiry_date) return false
      const expiryDate = new Date(s.expiry_date)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today
    })
  }, [activeStocks])

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, [])

  const handleFilterChange = useCallback((field: keyof StockFilter, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAdd = useCallback(() => {
    setEditingStock(null)
    setIsFormModalVisible(true)
  }, [])

  const handleEdit = useCallback((stock: Stock) => {
    setEditingStock(stock)
    setIsFormModalVisible(true)
  }, [])

  // Standart Silme
  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteStock(id)
    } catch (error) {
      console.error('Silme hatası:', error)
    }
  }, [deleteStock])

  // ✅ YENİ HANDLER'LAR - Pasif/Aktif/Kalıcı Silme
  const handleSoftDelete = useCallback(async (id: number) => {
    try {
      await softDeleteStock(id)
    } catch (error) {
      console.error('Soft delete hatası:', error)
    }
  }, [softDeleteStock])

  const handleHardDelete = useCallback(async (id: number) => {
    try {
      await hardDeleteStock(id)
    } catch (error) {
      console.error('Hard delete hatası:', error)
    }
  }, [hardDeleteStock])

  const handleReactivate = useCallback(async (id: number) => {
    try {
      await reactivateStock(id)
    } catch (error) {
      console.error('Reactivate hatası:', error)
    }
  }, [reactivateStock])

  const handleAdjust = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsAdjustModalVisible(true)
    adjustForm.setFieldsValue({
      performed_by: user?.name,
      is_sub_unit: false
    })
  }, [adjustForm, user])

  const handleUse = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsUseModalVisible(true)
    useForm.setFieldsValue({
      performed_by: user?.name
    })
  }, [useForm, user])

  const handleViewHistory = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsHistoryModalVisible(true)
  }, [])

  const onAdjustSubmit = useCallback(async (values: StockAdjustmentRequest) => {
    if (!selectedStock) return
    
    try {
      await adjustStock({ id: selectedStock.id, data: values })
      setIsAdjustModalVisible(false)
      setSelectedStock(null)
      adjustForm.resetFields()
    } catch (error) {
      console.error('Stok ayarlama hatası:', error)
    }
  }, [selectedStock, adjustStock, adjustForm])

  const handleStockUsage = useCallback(async (values: StockUsageRequest) => {
    if (!selectedStock) return
    
    try {
      await executeStockUsage({ id: selectedStock.id, data: values })
      setIsUseModalVisible(false)
      setSelectedStock(null)
      useForm.resetFields()
    } catch (error) {
      console.error('Stok kullanım hatası:', error)
    }
  }, [selectedStock, executeStockUsage, useForm])

  const onFormSuccess = useCallback(() => {
    setIsFormModalVisible(false)
    setEditingStock(null)
  }, [])

  // Modal handlers
  const handleFormModalClose = useCallback(() => setIsFormModalVisible(false), [])
  const handleAdjustModalClose = useCallback(() => setIsAdjustModalVisible(false), [])
  const handleUseModalClose = useCallback(() => setIsUseModalVisible(false), [])
  const handleHistoryModalClose = useCallback(() => {
    setIsHistoryModalVisible(false)
    setSelectedStock(null)
  }, [])

  return (
    <div>
      <Title level={2}>Stok Yönetimi</Title>
      
      {/* İstatistik Kartları */}
      <StockStats stats={stockStats} />
      
      {/* Uyarı Mesajları */}
      <StockAlerts 
        criticalStockItems={criticalStockItems}
        lowStockItems={lowStockItems}
        expiringItems={expiringItems}
      />
      
      {/* Filtreler */}
      <StockFilters 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onAdd={handleAdd}
      />

      <Card styles={{ body: { padding: 0 } }}>
        <StockTable 
          stocks={activeStocks}
          loading={isLoading || isSoftDeleting || isHardDeleting || isReactivating}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSoftDelete={handleSoftDelete}      // ✅ YENİ - Pasif yap
          onHardDelete={handleHardDelete}      // ✅ YENİ - Kalıcı sil
          onReactivate={handleReactivate}      // ✅ YENİ - Aktif et
          onAdjust={handleAdjust}
          onUse={handleUse}
          onViewHistory={handleViewHistory}
        />
      </Card>

      {/* Modal'lar */}
      <StockModals 
        // Form Modal
        isFormModalVisible={isFormModalVisible}
        editingStock={editingStock}
        onFormModalClose={handleFormModalClose}
        onFormSuccess={onFormSuccess}
        
        // Adjust Modal
        isAdjustModalVisible={isAdjustModalVisible}
        selectedStock={selectedStock}
        adjustForm={adjustForm}
        onAdjustModalClose={handleAdjustModalClose}
        onAdjustSubmit={onAdjustSubmit}
        isAdjusting={isAdjusting}
        
        // Use Modal
        isUseModalVisible={isUseModalVisible}
        useForm={useForm}
        onUseModalClose={handleUseModalClose}
        onUseSubmit={handleStockUsage}
        isUsing={isUsing}
      />

      {/* Geçmiş Hareketler Modal */}
      <StockHistoryModal 
        visible={isHistoryModalVisible}
        stock={selectedStock}
        onClose={handleHistoryModalClose}
      />
    </div>
  )
}