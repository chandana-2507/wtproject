import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAdminStatsQuery } from '../../app/apiSlice';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatPrice } from '../../utils/formatPrice';
import { Link } from 'react-router-dom';

const monthName = (m) =>
  [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][(m || 1) - 1] || '';

export default function AdminDashboard() {
  const { data, isLoading, isFetching, refetch } = useAdminStatsQuery();

  const chartData = useMemo(() => {
    const rows = data?.revenueByMonth || [];
    return rows.map((r) => ({
      name: monthName(r._id),
      revenue: Math.round(r.revenue || 0),
    }));
  }, [data]);

  const kpis = [
    { label: 'Total revenue', value: formatPrice(data?.totalRevenue || 0), tone: 'success' },
    { label: 'Orders', value: String(data?.totalOrders || 0), tone: 'info' },
    { label: 'Customers', value: String(data?.totalUsers || 0), tone: 'neutral' },
    { label: 'Products', value: String(data?.totalProducts || 0), tone: 'neutral' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Monitor revenue, orders, and recent activity.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, idx) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-2xl font-bold text-slate-900">{k.value}</p>
              <Badge tone={k.tone}>Live</Badge>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Revenue by month</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Orders snapshot</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-primary hover:text-indigo-700">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentOrders || []).map((o) => (
                <tr key={o._id}>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{o.user?.name || 'Guest'}</td>
                  <td className="py-3 pr-4">{formatPrice(o.totalPrice)}</td>
                  <td className="py-3 pr-4">
                    <Badge tone="neutral">{o.status}</Badge>
                  </td>
                  <td className="py-3 text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
