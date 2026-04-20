import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useSelector } from 'react-redux';
import { useApplyCouponMutation } from '../features/cart/cartApi';
import { useState } from 'react';
import Input from '../components/ui/Input';
import { formatPrice } from '../utils/formatPrice';
import Spinner from '../components/ui/Spinner';

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    loading,
    updateQty,
    removeItem,
    rawCart,
    refetchCart,
  } = useCart();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [coupon, setCoupon] = useState('');
  const [applyCoupon, { isLoading: couponBusy }] = useApplyCouponMutation();

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    try {
      await applyCoupon(coupon.trim()).unwrap();
      setCoupon('');
      await refetchCart();
    } catch {
      /* toast via axios */
    }
  };

  const stockFor = (line) => line.product?.stock ?? 9999;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shopping cart</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review your items, adjust quantities, and proceed to checkout when ready.
          </p>

          <div className="mt-8 space-y-4">
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner className="h-10 w-10" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
                <Link to="/products" className="mt-4 inline-block font-semibold text-primary hover:text-indigo-700">
                  Continue shopping
                </Link>
              </div>
            ) : (
              items.map((line) => (
                <CartItem
                  key={line.productId}
                  item={line}
                  onQtyChange={updateQty}
                  onRemove={removeItem}
                  maxStock={stockFor(line)}
                  busy={loading}
                />
              ))
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {isAuthenticated ? (
            <form onSubmit={handleCoupon} className="mb-6 flex gap-2">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="!py-2"
              />
              <Button type="submit" variant="outline" disabled={couponBusy}>
                {couponBusy ? <Spinner className="h-5 w-5" /> : 'Apply'}
              </Button>
            </form>
          ) : (
            <p className="mb-6 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
              Sign in to apply coupon codes.
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({rawCart?.couponApplied?.code})</span>
                <span className="font-semibold">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
              <span>Estimated total</span>
              <span>{formatPrice(Math.max(0, subtotal - discount))}</span>
            </div>
          </div>

          <Link to="/checkout">
            <Button variant="primary" className="mt-6 w-full" disabled={!items.length}>
              Checkout
            </Button>
          </Link>
          <Link
            to="/products"
            className="mt-4 block text-center text-sm font-semibold text-primary hover:text-indigo-700"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
