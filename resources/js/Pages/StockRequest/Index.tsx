import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { StockRequestsPage } from '@/Modules/stockRequest/Pages/StockRequestsPage';

const Index = () => {
    return (
        <>
            <Head title="Stok Talepleri" />
            <StockRequestsPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
