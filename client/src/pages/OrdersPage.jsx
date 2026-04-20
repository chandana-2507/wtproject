import { useMemo, useState } from 'react';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useCancelOrderMutation, useGetMyOrdersQuery } from '../features/orders/ordersApi';
import { formatPrice } from '../utils/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/ui/Spinner';

const tone = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

export default function OrdersPage() {
  const { data, isLoading, isFetching, refetch } = useGetMyOrdersQuery();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [openId, setOpenId] = useState(null);

  const orders = useMemo(() => data?.orders || [], [data]);

  const onCancel = async (id) => {
    await cancelOrder(id).unwrap();
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Orders' }]} />

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your orders</h1>
          <p className="mt-2 text-sm text-slate-600">Track shipments, view receipts, and manage returns.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600">
            You have not placed any orders yet.
          </div>
        )}

        {orders.map((o) => (
          <motion.div
            layout
            key={o._id}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenId(openId === o._id ? null : o._id)}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order #{String(o._id).slice(-8)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(o.createdAt).toLocaleString()} · {o.items?.length || 0} items
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={tone[o.status] || 'neutral'}>{o.status}</Badge>
                <span className="font-semibold text-slate-900">{formatPrice(o.totalPrice)}</span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openId === o._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 bg-slate-50 px-5 py-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipping</p>
                      <p className="mt-2 text-sm text-slate-800">{o.shippingAddress?.fullName}</p>
                      <p className="text-sm text-slate-700">{o.shippingAddress?.street}</p>
                      <p className="text-sm text-slate-700">
                        {o.shippingAddress?.city}, {o.shippingAddress?.state}{' '}
                        {o.shippingAddress?.postalCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
                      <p className="mt-2 text-sm text-slate-800">
                        {o.paymentMethod === 'stripe' ? 'Card (Stripe)' : 'Cash on delivery'}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Paid: {o.isPaid ? 'Yes' : 'No'} · Delivered: {o.isDelivered ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-inner">
                        <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{it.name}</p>
                          <p className="text-xs text-slate-600">
                            Qty {it.qty} × {formatPrice(it.price)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(it.price * it.qty)}</p>
                      </div>
                    ))}
                  </div>

                  {o.status === 'pending' && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="danger"
                        disabled={cancelling}
                        onClick={() => onCancel(o._id)}
                      >
                        Cancel order
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
