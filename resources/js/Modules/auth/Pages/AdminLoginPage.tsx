// src/modules/auth/Pages/AdminLoginPage.tsx

import React from 'react';
import { AdminLoginForm } from '../Components/AdminLoginForm';

export const AdminLoginPage: React.FC = () => {
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
