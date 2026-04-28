// src/modules/auth/Pages/LoginPage.tsx

import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { LoginForm } from '../Components/LoginForm';
import { useAuth } from '@/Modules/auth/Hooks/useAuth';

export const LoginPage: React.FC = () => {
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
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)'
    }}>
      <LoginForm />
    </div>
  );
};
