import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Breadcrumb from '../components/ui/Breadcrumb';
import Stepper from '../components/ui/Stepper';
import AddressForm from '../components/checkout/AddressForm';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderSummary from '../components/checkout/OrderSummary';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useCreateOrderMutation } from '../features/orders/ordersApi';
import { setSuccessOrderId } from '../features/orders/ordersSlice';
import { useGetAddressesQuery } from '../features/auth/authApi';
import toast from 'react-hot-toast';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, subtotal, discount, rawCart, refetchCart, clear, loading: cartLoading } = useCart();
  const { data: addrRes, isLoading: addrLoad } = useGetAddressesQuery();
  const [createOrder, { isLoading: orderBusy }] = useCreateOrderMutation();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');

  const shippingPrice = 99;        // in INR
  const taxPrice = useMemo(() => round2(subtotal * 0.18), [subtotal]); // 18% GST
  const total = useMemo(
    () => round2(subtotal - discount + shippingPrice + taxPrice),
    [subtotal, discount, shippingPrice, taxPrice]
  );

  // Pre-fill default address
  const defaultAddress = useMemo(() => {
    const list = addrRes?.addresses || [];
    return list.find((a) => a.isDefault) || list[0] || null;
  }, [addrRes]);

  useEffect(() => {
    if (defaultAddress && !address) {
      setAddress({
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
        label: defaultAddress.label,
        isDefault: defaultAddress.isDefault,
      });
    }
  }, [defaultAddress, address]);

  const onAddress = (data) => {
    setAddress(data);
    setStep(1);
  };

  // Called by PaymentForm after Razorpay success + verification
  const onCardDone = (paymentId) => {
    if (paymentId) setRazorpayPaymentId(paymentId);
    setStep(2);
  };

  const onPlaceOrder = async () => {
    if (!address) {
      toast.error('Missing address');
      return;
    }
    try {
      const body = {
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod,
        shippingPrice,
        taxPrice,
      };

      if (paymentMethod === 'razorpay') {
        body.razorpayPaymentId = razorpayPaymentId;
        body.isPaid = true;
        body.paidAt = new Date().toISOString();
      }

      const res = await createOrder(body).unwrap();
      dispatch(setSuccessOrderId(res.order._id));
      await clear();
      await refetchCart();
      navigate(`/order-success/${res.order._id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (cartLoading || addrLoad) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-600">
        Loading checkout...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/products')}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Checkout' },
        ]}
      />

      <div className="mb-10">
        <Stepper steps={['Shipping', 'Payment', 'Review']} active={step} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          {/* Step 0 — Address */}
          {step === 0 && (
            <AddressForm
              defaultValues={address || undefined}
              onSubmit={onAddress}
              submitting={false}
            />
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <PaymentForm
              processing={false}
              onConfirmCard={onCardDone}
              paymentMethod={paymentMethod}
              onChangeMethod={setPaymentMethod}
              onCodContinue={() => setStep(2)}
              orderAmount={total}
            />
          )}

          {/* Step 2 — Review & Confirm */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Confirm your order
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Review totals and shipping details before placing your order.
                </p>
              </div>

              {/* Address summary */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold">{address?.fullName}</p>
                <p>{address?.street}</p>
                <p>
                  {address?.city}, {address?.state} {address?.postalCode}
                </p>
                <p>{address?.country}</p>
                <p className="mt-1 text-slate-500">{address?.phone}</p>
              </div>

              {/* Payment method summary */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold">Payment</p>
                {paymentMethod === 'razorpay' ? (
                  <p className="text-green-600">
                    ✅ Paid online — ID: {razorpayPaymentId || 'confirmed'}
                  </p>
                ) : (
                  <p>Cash on Delivery</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  disabled={orderBusy}
                  onClick={onPlaceOrder}
                >
                  {orderBusy ? 'Placing order...' : 'Place order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shippingPrice={shippingPrice}
          taxPrice={taxPrice}
          discount={discount}
          total={total}
          couponCode={rawCart?.couponApplied?.code}
        />
      </div>
    </div>
  );
}