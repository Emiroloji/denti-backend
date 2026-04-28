// src/modules/roles/Services/roleApi.ts

import { api } from '@/Services/api';
import { ApiResponse } from '@/Types/common.types';
import { Role, PermissionGroup, RoleStorePayload } from '../Types/role.types';

export const roleApi = {
  // Tüm rolleri listele
  getAll: (): Promise<ApiResponse<Role[]>> => 
    api.get('/roles'),

  // Rol detayını getir
  getById: (id: number): Promise<ApiResponse<Role>> => 
    api.get(`/roles/${id}`),

  // Mevcut tüm izinleri gruplanmış olarak getir
  getPermissions: (): Promise<ApiResponse<PermissionGroup[]>> => 
    api.get('/roles/permissions'),

  // Yeni rol oluştur
  create: (data: RoleStorePayload): Promise<ApiResponse<Role>> => 
    api.post('/roles', data),

  // Rolü güncelle
  update: (id: number, data: RoleStorePayload): Promise<ApiResponse<Role>> => 
    api.put(`/roles/${id}`, data),

  // Rolü sil
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/roles/${id}`),
};
