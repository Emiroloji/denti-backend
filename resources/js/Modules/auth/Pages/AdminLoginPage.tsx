// src/modules/auth/Pages/AdminLoginPage.tsx

import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AdminLoginForm } from '../Components/AdminLoginForm';
import { useAuth } from '@/Modules/auth/Hooks/useAuth';

export const AdminLoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  ;

  useEffect(() => {
    if (isAuthenticated) {
      router.visit('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)'
    }}>
      <AdminLoginForm />
    </div>
  );
};
