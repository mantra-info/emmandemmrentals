'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    Users,
    Home,
    CalendarCheck,
    CreditCard,
    ScrollText,
    Receipt,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
        { label: 'Listings', href: '/admin/listings', icon: <Home size={20} /> },
        { label: 'Reservations', href: '/admin/reservations', icon: <CalendarCheck size={20} /> },
        { label: 'Payments', href: '/admin/payments', icon: <CreditCard size={20} /> },
        { label: 'Tax Profiles', href: '/admin/tax-profiles', icon: <Receipt size={20} /> },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: <ScrollText size={20} /> },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-y-0
      `}>
                {/* Fixed Header */}
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-xs text-gray-500 mt-1">Property Management</p>
                </div>

                {/* Scrollable Navigation Content */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                                        ? 'bg-zinc-900 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Fixed Footer */}
                <div className="p-4 border-t border-gray-100 space-y-1 flex-shrink-0">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            <Settings size={20} />
                            <span className="font-medium">Return to Site</span>
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/admin/login' })}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <X size={20} />
                            <span className="font-medium">Log Out</span>
                        </button>
                    </div>
                </div>
            </>
        );
    };

export default Sidebar;
