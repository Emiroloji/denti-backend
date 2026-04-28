import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { ProfilePage } from '@/Modules/profile/Pages/ProfilePage';

const Index = () => {
    return (
        <>
            <Head title="Profil" />
            <ProfilePage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
