// src/modules/roles/Hooks/useRoles.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { roleApi } from '../Services/roleApi';
import { RoleStorePayload } from '../Types/role.types';

export const useRoles = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Rolleri getir
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getAll,
    select: (data) => data.data,
  });

  // İzinleri (Permission Groups) getir
  const permissionsQuery = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: roleApi.getPermissions,
    select: (data) => data.data,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: roleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      message.success('Rol başarıyla oluşturuldu.');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleStorePayload }) => 
      roleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      message.success('Rol başarıyla güncellendi.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: roleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      message.success('Rol silindi.');
    },
  });

  return {
    roles: rolesQuery.data || [],
    isLoading: rolesQuery.isLoading,
    permissionGroups: permissionsQuery.data || [],
    isPermissionsLoading: permissionsQuery.isLoading,
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
