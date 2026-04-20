import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CartItem from './CartItem';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { useApplyCouponMutation } from '../../features/cart/cartApi';
import Spinner from '../ui/Spinner';
import { useSelector } from 'react-redux';

export default function CartDrawer({ open, onClose }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
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
  const [coupon, setCoupon] = useState('');
  const [applyCoupon, { isLoading: couponBusy }] = useApplyCouponMutation();

  const handleQty = async (productId, qty) => {
    await updateQty(productId, qty);
  };

  const handleRemove = async (productId) => {
    await removeItem(productId);
  };

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="fixed right-0 top-0 z-[121] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Your cart</p>
                <h2 className="text-lg font-bold text-slate-900">Shopping bag</h2>
              </div>
              <button type="button" className="rounded-full p-2 hover:bg-slate-100" onClick={onClose} aria-label="Close">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-300">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
                  Your cart is empty. Discover something you love.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((line) => (
                    <CartItem
                      key={line.productId}
                      item={line}
                      onQtyChange={handleQty}
                      onRemove={handleRemove}
                      maxStock={stockFor(line)}
                      busy={loading}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white p-5">
              {isAuthenticated ? (
                <form onSubmit={handleCoupon} className="mb-4 flex gap-2">
                  <Input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="!py-2 text-sm"
                  />
                  <Button type="submit" variant="outline" disabled={couponBusy} className="whitespace-nowrap">
                    {couponBusy ? <Spinner className="h-5 w-5" /> : 'Apply'}
                  </Button>
                </form>
              ) : (
                <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
                  Sign in to apply coupons and sync your cart across devices.
                </p>
              )}

              <div className="mb-4 space-y-2 text-sm">
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
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                  <span>Estimated total</span>
                  <span>{formatPrice(Math.max(0, subtotal - discount))}</span>
                </div>
              </div>

              <Link to="/checkout" onClick={onClose}>
                <Button type="button" variant="primary" className="w-full">
                  Checkout
                </Button>
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                className="mt-3 block text-center text-sm font-semibold text-primary hover:text-indigo-700"
              >
                View full cart
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
