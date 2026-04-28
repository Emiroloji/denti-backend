import React from 'react';
import { Head } from '@inertiajs/react';
import { AcceptInvitationPage } from '@/Modules/auth/Pages/AcceptInvitationPage';

interface Props {
    token: string;
}

const AcceptInvitation = ({ token }: Props) => {
    return (
        <>
            <Head title="Daveti Kabul Et" />
            <AcceptInvitationPage />
        </>
    );
};

export default AcceptInvitation;
