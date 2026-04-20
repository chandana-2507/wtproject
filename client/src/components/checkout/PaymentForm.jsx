import { useState } from 'react';
import Button from '../ui/Button';

export default function PaymentForm({
  processing,
  onConfirmCard,
  paymentMethod,
  onChangeMethod,
  onCodContinue,
  orderAmount,
}) {
  const [error, setError] = useState('');

  const handleRazorpaySubmit = async () => {
    setError('');
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: orderAmount }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Order creation failed');

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MyShop',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            setError('Payment verification failed. Contact support.');
            return;
          }
          await onConfirmCard(response.razorpay_payment_id);
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => setError('Payment cancelled. Try again.'),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">Payment method</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <input
              type="radio"
              name="pm"
              checked={paymentMethod === 'razorpay'}
              onChange={() => onChangeMethod('razorpay')}
            />
            Pay Online (UPI / Card / NetBanking)
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <input
              type="radio"
              name="pm"
              checked={paymentMethod === 'cod'}
              onChange={() => onChangeMethod('cod')}
            />
            Cash on Delivery
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {paymentMethod === 'razorpay' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            You'll be redirected to Razorpay's secure checkout to pay via
            UPI, Debit/Credit Card, Net Banking, or Wallets.
          </div>
          <Button
            type="button"
            variant="primary"
            disabled={processing}
            onClick={handleRazorpaySubmit}
          >
            {processing ? 'Processing...' : 'Pay with Razorpay'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
            Pay with cash when your order arrives.
          </div>
          <Button type="button" variant="primary" onClick={onCodContinue}>
            Continue to review
          </Button>
        </div>
      )}
    </div>
  );
}