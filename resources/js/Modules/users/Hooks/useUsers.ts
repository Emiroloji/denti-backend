// src/modules/users/Hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { userApi } from '../Services/userApi';
import { UpdateUserPayload, InviteUserPayload } from '../Types/user.types';

export const useUsers = (params?: { page?: number; per_page?: number; search?: string }) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Personel listesini getir
  const usersQuery = useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getAll(params),
    select: (data) => data.data,
  });

  // Yeni personel davet et
  const inviteMutation = useMutation({
    mutationFn: (data: InviteUserPayload) => 
      userApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Davetiye başarıyla gönderildi.');
    },
  });

  // Direkt kullanıcı oluştur (Süper Admin)
  const createMutation = useMutation({
    mutationFn: (data: any) => 
      userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Kullanıcı başarıyla oluşturuldu.');
    },
  });

  // Personel güncelle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) => 
      userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Personel bilgileri güncellendi.');
    },
  });

  // Personel sil
  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Personel klinikten kaldırıldı.');
    },
  });

  return {
    usersData: usersQuery.data, // Artık bir Pagination objesi ({ data: User[], total: number, ... }) dönebilir
    isLoading: usersQuery.isLoading,
    inviteUser: inviteMutation.mutateAsync,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
