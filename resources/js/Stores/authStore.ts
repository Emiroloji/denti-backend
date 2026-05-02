// s@/Stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/Modules/auth/Types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /**
   * Backend'den gelen doğrulanmış izin listesi.
   * Client-side'da türetilmiyor — her zaman sunucudan geliyor.
   * usePermissions hook'u bu listeyi kullanarak hasPermission() sağlar.
   */
  permissions: string[];
  /**
   * Session sunucu tarafında doğrulandı mı?
   * - false: Henüz /auth/me isteği atılmadı (uygulama yeni açıldı)
   * - true:  /auth/me başarılıyla döndü veya 401 geldi (her iki durumda da netlik var)
   *
   * ProtectedRoute bu flag true olana kadar loading gösterir.
   * Bu sayede localStorage'daki eski kullanıcı verisi nedeniyle yanıltıcı
   * "authenticated" görüntüsü oluşmaz (auth flicker önlemi).
   *
   * NOT: persist'e dahil edilmez — her sayfa açılışında false ile başlar.
   */
  isSessionValidated: boolean;
  setAuth: (user: User, permissions?: string[]) => void;
  setSessionValidated: (validated: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],
      isSessionValidated: false,

      setAuth: (user, permissions = []) => {
        set({ user, isAuthenticated: true, permissions, isSessionValidated: true });
      },

      setSessionValidated: (validated) => {
        set({ isSessionValidated: validated });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, permissions: [], isSessionValidated: false });
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null
        }));
      },
    }),
    {
      name: 'denti-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // ✅ Güvenlik: isAuthenticated localStorage'a yazılmıyor
      // DevTools'tan isAuthenticated: true yazarak oturum bypass ARTIK MÜMKÜN DEĞİL
      // isAuthenticated, user'ın varlığından derive ediliyor
      // isSessionValidated persist'e dahil değil — her açılışta false başlar
      partialize: (state) => ({
        user: state.user,
        // permissions persist edilmiyor — her login/session kontrolünde backend'den taze alınır
      }),
    }
  )
);
