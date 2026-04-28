import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { SuppliersPage } from '@/Modules/supplier/Pages/SuppliersPage';

const Index = () => {
    return (
        <>
            <Head title="Tedarikçiler" />
            <SuppliersPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
