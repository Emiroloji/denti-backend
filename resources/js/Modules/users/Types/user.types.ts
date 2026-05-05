// src/modules/users/Types/user.types.ts

export interface Permission {
  id: number;
  name: string;
}

import { Clinic } from '../../clinics/Types/clinic.types';

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  clinic_id?: number;
  clinic?: Clinic;
  is_active: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
}

export interface UpdateUserPayload {
  name: string;
  is_active: boolean;
  permissions: string[]; // Permission names or IDs
  clinic_id?: number;
}

export interface InviteUserPayload {
  email: string;
  role: string;
}
