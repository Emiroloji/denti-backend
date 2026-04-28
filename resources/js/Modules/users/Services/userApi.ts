// src/modules/users/Services/userApi.ts

import { api } from '@/Services/api';
import { ApiResponse } from '@/Types/common.types';
import { User, UpdateUserPayload, InviteUserPayload } from '../Types/user.types';

export const userApi = {
  // Klinik personel listesini getir (Sayfalama ve arama destekli)
  getAll: (params?: { page?: number; per_page?: number; search?: string }): Promise<ApiResponse<any>> => 
    api.get('/users', { params }),

  // Personel bilgilerini güncelle
  update: (id: number, data: UpdateUserPayload): Promise<ApiResponse<User>> => 
    api.put(`/users/${id}`, data),

  // Personeli klinikten sil
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/users/${id}`),

  // Yeni personel davet et (Email ile)
  inviteUser: (data: InviteUserPayload): Promise<ApiResponse<User>> => 
    api.post('/invitations/invite', data),

  // Direkt kullanıcı oluştur (Süper Admin yetkisiyle)
  create: (data: any): Promise<ApiResponse<User>> => 
    api.post('/users', data),
};
