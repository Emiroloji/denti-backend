// src/modules/users/Types/user.types.ts

import { Role } from '../../roles/Types/role.types';
import { Clinic } from '../../clinics/Types/clinic.types';

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  clinic_id?: number;
  clinic?: Clinic;
  is_active: boolean;
  roles: Role[];
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
}

export interface UpdateUserPayload {
  name: string;
  is_active: boolean;
  roles: string[]; // Role names or IDs
  clinic_id?: number;
}

export interface InviteUserPayload {
  email: string;
  role: string;
}
