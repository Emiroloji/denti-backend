// src/modules/stock/Services/stockApi.ts

import { api } from '@/Services/api'
import {
  Stock,
  Product,
  CreateProductRequest,
  CreateStockRequest,
  UpdateStockRequest,
  StockAdjustmentRequest,
  StockUsageRequest,
  StockFilter,
  StockStats
} from '../Types/stock.types'
import { ApiResponse } from '@/Types/common.types'

// Define proper interface for stock alerts
interface StockAlert {
  id: number
  stock_id: number
  type: 'low_stock' | 'critical_stock' | 'expiring'
  message: string
  is_resolved: boolean
  created_at: string
}

interface AlertCount {
  count: number
}

export const stockApi = {
  // CRUD Operations
  getAll: (filters?: StockFilter): Promise<ApiResponse<Stock[]>> =>
    api.get('/stocks', { params: filters }),

  getById: (id: number): Promise<ApiResponse<Stock>> => 
    api.get(`/stocks/${id}`),

  create: (data: CreateStockRequest): Promise<ApiResponse<Stock>> =>
    api.post('/stocks', data),

  update: (id: number, data: UpdateStockRequest): Promise<ApiResponse<Stock>> =>
    api.put(`/stocks/${id}`, data),

  delete: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/stocks/${id}`),

  // ✅ YENİ ENDPOINT'LER - PASIF/AKTİF/KALICI SİLME
  
  // Soft Delete (Pasif yap)
  softDelete: (id: number): Promise<ApiResponse<Stock>> =>
    api.put(`/stocks/${id}/deactivate`),

  // Hard Delete (Kalıcı sil)
  hardDelete: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/stocks/${id}/force`),

  // Reaktive et (Pasif'ten aktif'e çevir)
  reactivate: (id: number): Promise<ApiResponse<Stock>> =>
    api.put(`/stocks/${id}/reactivate`),

  // Stock Operations
  adjustStock: (id: number, data: StockAdjustmentRequest): Promise<ApiResponse<Stock>> =>
    api.post(`/stocks/${id}/adjust`, data),

  useStock: (id: number, data: StockUsageRequest): Promise<ApiResponse<Stock>> =>
    api.post(`/stocks/${id}/use`, data),

  getTransactions: (id: number): Promise<ApiResponse<any[]>> =>
    api.get(`/stocks/${id}/transactions`),

  getStockTransactions: (id: number, params: string = ''): Promise<ApiResponse<any>> =>
    api.get(`/stocks/${id}/transactions${params ? '?' + params : ''}`),

  // Stock Levels
  getLowStockItems: (): Promise<ApiResponse<Stock[]>> => 
    api.get('/stocks/low-level'),

  getCriticalStockItems: (): Promise<ApiResponse<Stock[]>> => 
    api.get('/stocks/critical-level'),

  getExpiringItems: (days?: number): Promise<ApiResponse<Stock[]>> =>
    api.get('/stocks/expiring', { params: { days: days || 30 } }),

  // Statistics
  getStats: (): Promise<ApiResponse<StockStats>> => 
    api.get('/stocks/stats'),

  // Bulk Operations
  bulkUpdate: (ids: number[], data: Partial<UpdateStockRequest>): Promise<ApiResponse<Stock[]>> =>
    api.put('/stocks/bulk-update', { ids, data }),

  bulkDelete: (ids: number[]): Promise<ApiResponse<null>> =>
    api.delete('/stocks/bulk-delete', { data: { ids } }),

  // Stock alerts
  getStockAlerts: (): Promise<ApiResponse<StockAlert[]>> => 
    api.get('/stock-alerts'),

  // Alert count
  getAlertCount: (): Promise<ApiResponse<AlertCount>> => 
    api.get('/stock-alerts/count'),

  // Pending alert count
  getPendingAlertCount: (): Promise<ApiResponse<AlertCount>> => 
    api.get('/stock-alerts/pending/count'),

  // Products
  getProducts: (filters?: any): Promise<ApiResponse<Product[]>> =>
    api.get('/products', { params: filters }),

  getProductById: (id: number): Promise<ApiResponse<Product>> =>
    api.get(`/products/${id}`),

  createProduct: (data: CreateProductRequest): Promise<ApiResponse<Product>> =>
    api.post('/products', data),

  updateProduct: (id: number, data: any): Promise<ApiResponse<Product>> =>
    api.put(`/products/${id}`, data),

  deleteProduct: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/products/${id}`),

  getProductTransactions: (id: number): Promise<ApiResponse<any[]>> =>
    api.get(`/products/${id}/transactions`),

  reverseTransaction: (id: number): Promise<ApiResponse<any>> =>
    api.post(`/transactions/${id}/reverse`),
}