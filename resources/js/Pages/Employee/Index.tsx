import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { UserManagementPage } from '@/Modules/users/Pages/UserManagementPage';

const Index = () => {
    return (
        <>
            <Head title="Personel Yönetimi" />
            <UserManagementPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
