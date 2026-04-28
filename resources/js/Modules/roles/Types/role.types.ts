// src/modules/roles/Types/role.types.ts

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  module: string;
  description?: string;
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface RoleStorePayload {
  name: string;
  permissions: string[]; // Permission names (e.g. ['view-stocks', 'create-stocks'])
}
