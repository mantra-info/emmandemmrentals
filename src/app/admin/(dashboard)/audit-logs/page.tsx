'use client';

import { useEffect, useMemo, useState } from 'react';

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ q: '', action: '', dateFrom: '', dateTo: '' });
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.action) params.set('action', filters.action);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        return params.toString();
    }, [filters, page, pageSize]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`/api/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
                if (!response.ok) throw new Error('Failed to fetch logs');
                const data = await response.json();
                setLogs(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            } catch (error) {
                console.error('Failed to load audit logs:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [queryString]);

    useEffect(() => {
        setPage(1);
    }, [filters.q, filters.action, filters.dateFrom, filters.dateTo]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track administrative actions for accountability.</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
                    <input
                        value={filters.q}
                        onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                        placeholder="Search by admin email, target ID, or action"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    />
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    >
                        <option value="">Action</option>
                        <option value="set_role">set_role</option>
                        <option value="deactivate">deactivate</option>
                        <option value="reactivate">reactivate</option>
                        <option value="soft_delete">soft_delete</option>
                        <option value="hard_delete">hard_delete</option>
                        <option value="revoke_sessions">revoke_sessions</option>
                        <option value="reset_password">reset_password</option>
                    </select>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    />
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-black"
                    />
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium mb-4">No audit logs found.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <div className="col-span-3">Admin</div>
                        <div className="col-span-3">Action</div>
                        <div className="col-span-3">Target</div>
                        <div className="col-span-3">Time</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                <div className="col-span-3 text-sm  text-gray-700">
                                    <p className="font-semibold text-gray-900">{log.admin?.name || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">{log.admin?.email}</p>
                                </div>
                                <div className="col-span-3 text-sm  text-gray-700">
                                    <p className="font-semibold text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-500">{log.targetType || 'user'}</p>
                                </div>
                                <div className="col-span-3 text-xs text-gray-600">
                                    {log.targetUser ? (
                                        <div>
                                            <p className="font-semibold text-gray-900">{log.targetUser.name || 'User'}</p>
                                            <p className="text-xs text-gray-500">{log.targetUser.email || ''}</p>
                                            <p className="text-[10px] text-gray-400">{log.targetId}</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">{log.targetId || '—'}</span>
                                    )}
                                </div>
                                <div className="col-span-3 text-xs text-gray-500">
                                    {formatDateTime(log.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {total > 0 && (
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page {page} of {totalPages} · {total} total logs
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
        </div>
    );
}
