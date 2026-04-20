import { formatPrice } from '../../utils/formatPrice';

export default function OrderSummary({
  items = [],
  subtotal,
  shippingPrice,
  taxPrice,
  discount,
  total,
  couponCode,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Order summary</h3>
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {items.map((line) => (
          <div key={line.productId + (line.product?.name || '')} className="flex gap-3">
            <img
              src={line.product?.images?.[0]?.url || 'https://placehold.co/80x80'}
              alt=""
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{line.product?.name}</p>
              <p className="text-xs text-slate-500">
                Qty {line.qty} × {formatPrice(line.price)}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatPrice(line.price * line.qty)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-semibold text-slate-900">{formatPrice(shippingPrice)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Estimated tax</span>
          <span className="font-semibold text-slate-900">{formatPrice(taxPrice)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
            <span className="font-semibold">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
