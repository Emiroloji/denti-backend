import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { CategoriesPage } from '@/Modules/category/Pages/CategoriesPage';

const Index = () => {
    return (
        <>
            <Head title="Stok Kategorileri" />
            <CategoriesPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
