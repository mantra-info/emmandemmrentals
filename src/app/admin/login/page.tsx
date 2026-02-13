import React from 'react';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export const metadata = {
    title: 'Admin Login | EMM',
    description: 'Secure login for administrative access.',
};

const AdminLoginPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
            <AdminLoginForm />

            <div className="mt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} EMM Administrative Portal. All rights reserved.
            </div>
        </div>
    );
};

export default AdminLoginPage;
