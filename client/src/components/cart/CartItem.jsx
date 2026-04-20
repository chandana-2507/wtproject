import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/formatPrice';

export default function CartItem({
  item,
  onQtyChange,
  onRemove,
  maxStock = 9999,
  busy = false,
}) {
  const p = item.product;
  const name = p?.name || 'Product';
  const image = p?.images?.[0]?.url || 'https://placehold.co/80x80?text=No+image';
  const id = item.productId || p?._id;

  return (
    <div className="flex gap-4 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <Link to={`/products/${id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <img src={image} alt="" className="h-full w-full object-cover transition hover:scale-105" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link to={`/products/${id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-primary">
            {name}
          </Link>
          <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(item.price)}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
            <button
              type="button"
              disabled={busy || item.qty <= 1}
              className="p-2 text-slate-600 hover:bg-white disabled:opacity-40"
              onClick={() => onQtyChange(id, item.qty - 1)}
              aria-label="Decrease quantity"
            >
              <FiMinus className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-semibold">{item.qty}</span>
            <button
              type="button"
              disabled={busy || item.qty >= maxStock}
              className="p-2 text-slate-600 hover:bg-white disabled:opacity-40"
              onClick={() => onQtyChange(id, item.qty + 1)}
              aria-label="Increase quantity"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="!p-2 text-red-600 hover:bg-red-50"
            onClick={() => onRemove(id)}
            disabled={busy}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
