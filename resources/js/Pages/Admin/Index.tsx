import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { CompanyManagementPage } from '@/Modules/admin/Pages/CompanyManagementPage';

const Index = () => {
    return (
        <>
            <Head title="Şirket Yönetimi" />
            <CompanyManagementPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
