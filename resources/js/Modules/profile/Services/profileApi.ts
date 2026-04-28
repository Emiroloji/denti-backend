// src/modules/profile/Services/profileApi.ts

import { api } from '@/Services/api';
import { ApiResponse } from '@/Types/common.types';
import { User } from '../../auth/Types/auth.types';
import { UpdateProfileRequest, UpdatePasswordRequest } from '../Types/profile.types';

export const profileApi = {
  /**
   * Updates basic profile information (name, email)
   */
  updateInfo: (data: UpdateProfileRequest): Promise<ApiResponse<User>> =>
    api.put('/profile/info', data),

  /**
   * Updates user password
   */
  updatePassword: (data: UpdatePasswordRequest): Promise<ApiResponse<null>> =>
    api.put('/profile/password', data),
};
