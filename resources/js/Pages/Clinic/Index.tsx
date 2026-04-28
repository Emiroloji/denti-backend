import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { ClinicsPage } from '@/Modules/clinics/Pages/ClinicsPage';

const Index = () => {
    return (
        <>
            <Head title="Klinikler" />
            <ClinicsPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
