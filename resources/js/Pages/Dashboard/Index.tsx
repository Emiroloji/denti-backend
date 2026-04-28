import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { HomePage } from '@/Modules/dashboard/Pages/HomePage';

const Index = () => {
    return (
        <>
            <Head title="Ana Sayfa" />
            <HomePage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
