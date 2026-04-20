import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import { useGetOrderByIdQuery } from '../features/orders/ordersApi';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatPrice';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetOrderByIdQuery(id);

  const order = data?.order;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">Order not found</p>
        <Link to="/orders" className="mt-4 inline-block font-semibold text-primary">
          View orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Order confirmed' }]} />

      <div className="mt-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Thank you</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Your order is confirmed</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
          We sent a confirmation email with your receipt and tracking updates as your package ships.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Order total</span>
            <span className="text-lg font-bold text-slate-900">{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Order ID</span>
            <span className="font-mono text-xs text-slate-800">{String(order._id)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/orders">
            <Button variant="primary">View orders</Button>
          </Link>
          <Link to="/products">
            <Button variant="outline">Continue shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
