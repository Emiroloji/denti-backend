// src/modules/auth/Pages/LoginPage.tsx

import React from 'react';
import { LoginForm } from '../Components/LoginForm';

export const LoginPage: React.FC = () => {
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
