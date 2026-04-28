// src/modules/auth/Services/authApi.ts

import { api } from '@/Services/api';
import { AuthResponse, LoginCredentials, AcceptInvitationPayload, TwoFactorPayload } from '../Types/auth.types';

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> => 
    api.post('/login', credentials),

  adminLogin: (credentials: Omit<LoginCredentials, 'clinic_code'>): Promise<AuthResponse> =>
    api.post('/admin/login', credentials),

  verify2fa: (data: TwoFactorPayload): Promise<AuthResponse> =>
    api.post('/auth/2fa/verify', data),

  logout: (): Promise<{ success: boolean; message: string }> => 
    api.post('/auth/logout'),

  me: (): Promise<AuthResponse> => 
    api.get('/auth/me'),

  // Yeni Eklenen: Davet Kabul İşlemi
  acceptInvitation: (data: AcceptInvitationPayload): Promise<AuthResponse> =>
    api.post('/invitations/accept', data),
};

export default authApi;