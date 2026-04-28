import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { TodosPage } from '@/Modules/todo/Pages/TodosPage';

const Index = () => {
    return (
        <>
            <Head title="Yapılacaklar" />
            <TodosPage />
        </>
    );
};

Index.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Index;
