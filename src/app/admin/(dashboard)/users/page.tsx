'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, MoreVertical } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [filters, setFilters] = useState({ q: '', role: '', status: '' });
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (filters.q) params.set('q', filters.q);
                if (filters.role) params.set('role', filters.role);
                if (filters.status) params.set('status', filters.status);
                params.set('page', String(page));
                params.set('pageSize', String(pageSize));
                const response = await fetch(`/api/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
                const data = await response.json();
                setUsers(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [filters, page]);

    useEffect(() => {
        setPage(1);
    }, [filters.q, filters.role, filters.status]);

    const loadUserDetails = async (id: string) => {
        try {
            setDetailLoading(true);
            const response = await fetch(`/api/admin/users/${id}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load user');
            setSelectedUser(data);
        } catch (error) {
            console.error('Failed to load user detail:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const performAction = async (action: string, userId: string, payload: any = {}) => {
        try {
            const response = await fetch('/api/admin/users/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userId, ...payload }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Action failed');
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
            if (selectedUser?.id === userId) {
                setSelectedUser((prev: any) => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed. Check console for details.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage users, roles, access, and activity.</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
                    <input
                        value={filters.q}
                        onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                        placeholder="Search by name, email, or phone"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    />
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    >
                        <option value="">Role</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="HOST">HOST</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    >
                        <option value="">Status</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DEACTIVATED">DEACTIVATED</option>
                        <option value="DELETED">DELETED</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold overflow-hidden">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    (user.name || user.email || '?').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.name || 'Anonymous'}</div>
                                                <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                                                user.role === 'HOST' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <div className={`mt-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.status === 'DEACTIVATED' ? 'bg-red-50 text-red-600' : user.status === 'DELETED' ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {user.status || 'ACTIVE'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {user.phoneNumber && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone size={12} /> {user.phoneNumber}
                                                </div>
                                            )}
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Mail size={12} /> Email Verified
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-black text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => loadUserDetails(user.id)}
                                                className="px-3 py-2 text-xs text-black font-semibold border border-gray-200 rounded-lg hover:bg-gray-50"
                                            >
                                                View
                                            </button>
                                            <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                                <MoreVertical size={16} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {total > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page {page} of {totalPages} · {total} total users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {selectedUser && (
                <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                            <p className="text-xs text-gray-500">Account ID: {selectedUser.id}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => performAction(selectedUser.status === 'DEACTIVATED' ? 'reactivate' : 'deactivate', selectedUser.id)}
                                className="px-4 py-2 text-xs text-black font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                                {selectedUser.status === 'DEACTIVATED' ? 'Reactivate' : 'Deactivate'}
                            </button>
                            <button
                                onClick={() => performAction('revoke_sessions', selectedUser.id)}
                                className="px-4 py-2 text-xs text-black font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                                Force Logout
                            </button>
                            {/* <button
                                onClick={async () => {
                                    const response = await fetch('/api/admin/users/actions', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ action: 'reset_password', userId: selectedUser.id }),
                                    });
                                    const data = await response.json();
                                    if (!response.ok) {
                                        alert(data.error || 'Reset failed');
                                        return;
                                    }
                                    alert(`Temporary password: ${data.tempPassword}`);
                                }}
                                className="px-4 py-2 text-xs text-black font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                                Reset Password
                            </button> */}
                            <button
                                onClick={() => performAction('soft_delete', selectedUser.id)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-red-600 hover:bg-red-50"
                            >
                                Soft Delete
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Permanently delete this user? This cannot be undone.')) {
                                        performAction('hard_delete', selectedUser.id);
                                    }
                                }}
                                className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                            >
                                Hard Delete
                            </button>
                        </div>
                    </div>

                    {detailLoading ? (
                        <div className="flex items-center justify-center min-h-[120px]">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs text-gray-500">Role</p>
                                <select
                                    value={selectedUser.role}
                                    onChange={(e) => performAction('set_role', selectedUser.id, { role: e.target.value })}
                                    className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="HOST">HOST</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-4">Status</p>
                                <p className="text-sm  font-semibold text-gray-900">{selectedUser.status}</p>
                                {selectedUser.deactivatedAt && (
                                    <p className="text-xs text-gray-500 mt-2">Deactivated: {new Date(selectedUser.deactivatedAt).toLocaleDateString()}</p>
                                )}
                                {selectedUser.deletedAt && (
                                    <p className="text-xs text-gray-500 mt-1">Deleted: {new Date(selectedUser.deletedAt).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs text-gray-500 mb-2">Reservations</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedUser.reservations?.length ? selectedUser.reservations.map((r: any) => (
                                        <div key={r.id} className="text-xs text-gray-700 flex items-center gap-2">
                                            <img src={r.listing?.imageSrc} alt="" className="w-8 h-8 rounded object-cover" />
                                            <div>
                                                <p className="font-semibold">{r.listing?.title}</p>
                                                <p className="text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-gray-400">No reservations</p>}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs text-gray-500 mb-2">Listings</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedUser.listings?.length ? selectedUser.listings.map((l: any) => (
                                        <div key={l.id} className="text-xs text-gray-700 flex items-center gap-2">
                                            <img src={l.imageSrc} alt="" className="w-8 h-8 rounded object-cover" />
                                            <div>
                                                <p className="font-semibold">{l.title}</p>
                                                <p className="text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-gray-400">No listings</p>}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs text-gray-500 mb-2">Reviews</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedUser.reviews?.length ? selectedUser.reviews.map((r: any) => (
                                        <div key={r.id} className="text-xs text-gray-700">
                                            <p className="font-semibold">{r.listing?.title}</p>
                                            <p className="text-gray-500">{r.comment?.slice(0, 60)}...</p>
                                        </div>
                                    )) : <p className="text-xs text-gray-400">No reviews</p>}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 lg:col-span-3">
                                <p className="text-xs text-gray-500 mb-2">Audit Logs</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedUser.auditLogs?.length ? selectedUser.auditLogs.map((log: any) => (
                                        <div key={log.id} className="text-xs text-gray-700 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{log.action}</p>
                                                <p className="text-gray-500">By: {log.admin?.email || 'Admin'}</p>
                                            </div>
                                            <span className="text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                    )) : <p className="text-xs text-gray-400">No admin actions yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
