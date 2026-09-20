import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SectionCard from '@/Components/SectionCard';
import StatusBadge from '@/Components/StatusBadge';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, ScrollText, Search } from 'lucide-react';
import { useState } from 'react';

interface AuditLog {
    id: number;
    action: string;
    subject_type: string;
    auditable_id: number;
    label: string | null;
    changes: { before?: Record<string, unknown>; after?: Record<string, unknown> } | null;
    ip_address: string | null;
    created_at: string;
    user: { id: number; name: string } | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    logs: Paginated<AuditLog>;
    filters: { action?: string; type?: string; search?: string };
    types: string[];
}

const ACTION_LEVEL: Record<string, 'safe' | 'moderate' | 'critical' | 'neutral'> = {
    created: 'safe',
    updated: 'moderate',
    deleted: 'critical',
};

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export default function Index({ logs, filters, types }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (patch: Record<string, string>) => {
        router.get(route('admin.audit-logs.index'), { ...filters, ...patch }, {
            preserveState: true,
            replace: true,
        });
    };

    const selectClass =
        'h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';

    return (
        <AuthenticatedLayout>
            <Head title="Audit Log" />

            <PageHeader
                title="Audit Log"
                subtitle={`${logs.total} recorded ${logs.total === 1 ? 'change' : 'changes'} to system records.`}
                icon={
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                        <ScrollText className="h-6 w-6 text-brand-500" />
                    </span>
                }
            />

            <SectionCard className="mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({ search });
                        }}
                        className="relative min-w-[220px] flex-1"
                    >
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search record or person…"
                            className="h-10 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                        />
                    </form>

                    <select
                        value={filters.action ?? ''}
                        onChange={(e) => applyFilter({ action: e.target.value })}
                        className={selectClass}
                    >
                        <option value="">All actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </select>

                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilter({ type: e.target.value })}
                        className={selectClass}
                    >
                        <option value="">All record types</option>
                        {types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </SectionCard>

            <SectionCard title="Activity" flush>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-sm">
                        <thead>
                            <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="w-10 px-5 py-3" />
                                <th className="px-5 py-3">When</th>
                                <th className="px-5 py-3">Who</th>
                                <th className="px-5 py-3">Action</th>
                                <th className="px-5 py-3">Record</th>
                                <th className="px-5 py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log) => {
                                const isOpen = expanded === log.id;
                                const hasDetail = Boolean(log.changes?.before || log.changes?.after);

                                return (
                                    <>
                                        <tr
                                            key={log.id}
                                            className={cn(
                                                'border-b border-slate-100 transition-colors',
                                                hasDetail && 'cursor-pointer hover:bg-slate-50',
                                            )}
                                            onClick={() => hasDetail && setExpanded(isOpen ? null : log.id)}
                                        >
                                            <td className="px-5 py-3.5 text-slate-400">
                                                {hasDetail && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {log.user ? (
                                                    <span className="font-medium text-navy-900">{log.user.name}</span>
                                                ) : (
                                                    <span className="italic text-slate-400">System</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge level={ACTION_LEVEL[log.action] ?? 'neutral'} label={log.action} dot />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-medium text-navy-900">{log.subject_type}</span>
                                                {log.label && <span className="text-slate-500"> · {log.label}</span>}
                                                <span className="text-xs text-slate-400"> #{log.auditable_id}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-400">{log.ip_address ?? '—'}</td>
                                        </tr>

                                        {isOpen && (
                                            <tr key={`${log.id}-detail`} className="border-b border-slate-100 bg-slate-50/70">
                                                <td colSpan={6} className="px-5 py-4">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="text-left text-slate-500">
                                                                <th className="py-1.5 pr-4">Field</th>
                                                                <th className="py-1.5 pr-4">Before</th>
                                                                <th className="py-1.5">After</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="font-mono">
                                                            {Object.keys({ ...log.changes?.before, ...log.changes?.after }).map((field) => (
                                                                <tr key={field} className="border-t border-slate-200">
                                                                    <td className="py-1.5 pr-4 font-sans font-medium text-navy-900">{field}</td>
                                                                    <td className="py-1.5 pr-4 text-red-600">{formatValue(log.changes?.before?.[field])}</td>
                                                                    <td className="py-1.5 text-emerald-700">{formatValue(log.changes?.after?.[field])}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                        No audit entries match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-5 py-4">
                        {logs.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                className={cn(
                                    'h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors',
                                    link.active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100',
                                    !link.url && 'cursor-not-allowed opacity-40',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </SectionCard>
        </AuthenticatedLayout>
    );
}
