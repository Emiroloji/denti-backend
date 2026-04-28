import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { StockList } from '@/Modules/stock/Components/StockList';

const Index = () => {
    return (
        <>
            <Head title="Stok Yönetimi" />
            <StockList />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
