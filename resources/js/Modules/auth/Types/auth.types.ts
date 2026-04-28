// src/modules/auth/Types/auth.types.ts

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  company_id: number;
  /**
   * @deprecated Eski format. Yeni kod 'roles' array'ini kullanmalıdır.
   * Spatie Permission entegrasyonu ile roles array'i kullanılmaktadır.
   */
  role?: 'admin' | 'staff' | 'clinic_manager';
  /** Spatie Permission rolleri */
  roles?: Role[];
  /** Backend'den gelen doğrulanmış izin listesi (login/me response'undan) */
  permissions?: string[];
  avatar?: string;
  clinic_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  /** 2FA gerekiyor mu? */
  requires_2fa?: boolean;
  data?: {
    user: User;
    /** Backend'den gelen doğrulanmış izin listesi */
    permissions?: string[];
    // Token artık response body'sinde değil, güvenli cookie'de
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface TwoFactorPayload {
  code: string;
}

export interface AcceptInvitationPayload {
  token: string;
  name: string;
  password: string;
  password_confirmation: string;
}

