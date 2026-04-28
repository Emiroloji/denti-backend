import React from 'react';
import { Head } from '@inertiajs/react';
import { AdminLoginForm } from '@/Modules/auth/Components/AdminLoginForm';

const AdminLogin = () => {
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)'
        }}>
            <Head title="Admin Girişi" />
            <AdminLoginForm />
        </div>
    );
};

export default AdminLogin;
