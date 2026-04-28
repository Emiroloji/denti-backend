import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { ReportsPage } from '@/Modules/reports/Pages/ReportsPage';

const Index = () => {
    return (
        <>
            <Head title="Raporlar" />
            <ReportsPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
