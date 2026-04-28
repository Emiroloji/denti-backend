import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { RolesPage } from '@/Modules/roles/Pages/RolesPage';

const Index = () => {
    return (
        <>
            <Head title="Rol ve Yetkiler" />
            <RolesPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
