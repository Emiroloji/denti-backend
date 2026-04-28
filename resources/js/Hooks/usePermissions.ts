// s@/Hooks/usePermissions.ts

import { useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export const usePermissions = () => {
  const { auth } = usePage<any>().props;
  const user = auth.user;
  const permissions = user?.permissions || [];

  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    const target = roleName.toLowerCase().trim();

    if (Array.isArray(user.roles)) {
      return user.roles.some((name: string) => {
        const normalizedName = name.toLowerCase().trim();
        if (normalizedName === 'admin') return true;
        if (normalizedName === target) return true;
        if (normalizedName.replace(/[-_]/g, ' ') === target.replace(/[-_]/g, ' ')) return true;
        return false;
      });
    }

    return false;
  }, [user]);

  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.some(role => hasRole(role));
  }, [hasRole]);

  const hasPermission = useCallback((permissionName: string): boolean => {
    if (!user || !permissions || permissions.length === 0) return false;
    return permissions.includes(permissionName);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((permissionNames: string[]): boolean => {
    return permissionNames.some(p => hasPermission(p));
  }, [hasPermission]);

  const isSuperAdminVal = useMemo(() => hasRole('Super Admin'), [hasRole]);
  const isCompanyOwnerVal = useMemo(() => hasRole('Company Owner'), [hasRole]);

  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin: () => isSuperAdminVal,
    isCompanyOwner: () => isCompanyOwnerVal,
    isAdmin: isSuperAdminVal || isCompanyOwnerVal,
    userRoles: user?.roles || [],
    userPermissions: permissions,
  };
};
