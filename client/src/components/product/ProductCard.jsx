import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/formatPrice';
import { useCart } from '../../hooks/useCart';
import { useToggleWishlistApiMutation } from '../../features/auth/authApi';
import { guestToggleId } from '../../features/wishlist/wishlistSlice';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.user);
  const guestIds = useSelector((s) => s.wishlistLocal.guestIds);
  const [toggleWishlist] = useToggleWishlistApiMutation();

  const image = product.images?.[0]?.url || 'https://placehold.co/600x600?text=Product';
  const sale = product.comparePrice > product.price;
  const out = product.stock <= 0;

  const wishlisted = isAuthenticated
    ? user?.wishlist?.some((w) => (typeof w === 'string' ? w : w._id) === product._id)
    : guestIds.includes(product._id);

  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isAuthenticated) await toggleWishlist(product._id).unwrap();
      else dispatch(guestToggleId(product._id));
    } catch {
      /* toast via axios */
    }
  };

  const onQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product, 1);
    } catch {
      /* toast */
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <Link to={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {sale && !out && <Badge tone="warning">Sale</Badge>}
          {!sale && product.isFeatured && <Badge tone="info">Featured</Badge>}
          {out && <Badge tone="danger">Out of stock</Badge>}
        </div>
        <button
          type="button"
          onClick={onWish}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700'} />
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="pointer-events-auto">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={out}
              onClick={onQuickAdd}
            >
              Quick add
            </Button>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.brand}</p>
        <Link to={`/products/${product._id}`} className="mt-1 line-clamp-2 font-semibold text-slate-900 hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={product.ratings} showValue />
          <span className="text-xs text-slate-500">({product.numReviews})</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
            {sale && (
              <p className="text-sm text-slate-400 line-through">{formatPrice(product.comparePrice)}</p>
            )}
          </div>
          <Badge tone="neutral">{product.category}</Badge>
        </div>
      </div>
    </motion.article>
  );
}
