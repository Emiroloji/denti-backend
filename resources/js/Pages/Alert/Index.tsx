import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { AlertsPage } from '@/Modules/alerts/Pages/AlertsPage';

const Index = () => {
    return (
        <>
            <Head title="Uyarılar" />
            <AlertsPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
