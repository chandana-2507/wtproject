import { useMemo, useState } from 'react';
import { useAdminOrdersQuery, useAdminUpdateOrderMutation } from '../../app/apiSlice';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatPrice } from '../../utils/formatPrice';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const { data, isLoading, refetch, isFetching } = useAdminOrdersQuery(
    { status: status || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const [updateOrder, { isLoading: saving }] = useAdminUpdateOrderMutation();

  const orders = useMemo(() => data?.orders || [], [data]);

  const onStatusChange = async (id, next) => {
    await updateOrder({ id, status: next }).unwrap();
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Operations</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Orders</h1>
          <p className="mt-2 text-sm text-slate-600">Filter and update fulfillment status in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Spinner className="mx-auto h-8 w-8" />
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{o.user?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-500">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.totalPrice)}</td>
                  <td className="px-4 py-3">
                    {o.isPaid ? <Badge tone="success">Paid</Badge> : <Badge tone="warning">Unpaid</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold"
                      value={o.status}
                      disabled={saving}
                      onChange={(e) => onStatusChange(o._id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
