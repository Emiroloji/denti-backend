// src/modules/supplier/Services/supplierApi.ts

import { api } from '@/Services/api'
import { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierFilter,
  SupplierStats 
} from '../Types/supplier.types'
import { ApiResponse } from '@/Types/common.types'

export const supplierApi = {
  // CRUD Operations
  getAll: (filters?: SupplierFilter): Promise<ApiResponse<Supplier[]>> => 
    api.get('/suppliers', { params: filters }),
  
  getById: (id: number): Promise<ApiResponse<Supplier>> => 
    api.get(`/suppliers/${id}`),
  
  create: (data: CreateSupplierRequest): Promise<ApiResponse<Supplier>> => 
    api.post('/suppliers', data),
  
  update: (id: number, data: UpdateSupplierRequest): Promise<ApiResponse<Supplier>> => 
    api.put(`/suppliers/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/suppliers/${id}`),

  // Active suppliers list
  getActive: (): Promise<ApiResponse<Supplier[]>> => 
    api.get('/suppliers/active/list'),

  // Statistics
  getStats: (): Promise<ApiResponse<SupplierStats>> => 
    api.get('/suppliers/stats'),
}