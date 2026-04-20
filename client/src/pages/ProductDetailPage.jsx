import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import ProductImageGallery from '../components/product/ProductImageGallery';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewsQuery,
} from '../app/apiSlice';
import { useGetProductByIdQuery } from '../features/products/productsApi';
import { reviewSchema } from '../utils/validators';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { useDispatch, useSelector } from 'react-redux';
import { useToggleWishlistApiMutation } from '../features/auth/authApi';
import { guestToggleId } from '../features/wishlist/wishlistSlice';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useGetProductByIdQuery(id);
  const product = data?.product;
  const initialReviews = data?.reviews || [];

  const [tab, setTab] = useState('details');
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.user);
  const guestIds = useSelector((s) => s.wishlistLocal.guestIds);
  const [toggleWishlist] = useToggleWishlistApiMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  const [createReview, { isLoading: reviewBusy }] = useCreateReviewMutation();
  const [removeReview, { isLoading: deleteBusy }] = useDeleteReviewMutation();

  const { data: paginatedReviews } = useGetReviewsQuery(
    { productId: id, page: 1, limit: 20 },
    { skip: !id }
  );

  const reviews = paginatedReviews?.reviews?.length ? paginatedReviews.reviews : initialReviews;

  const wishlisted = isAuthenticated
    ? user?.wishlist?.some(
        (w) => (typeof w === 'string' ? w : w._id)?.toString?.() === product?._id?.toString?.()
      )
    : guestIds?.some((g) => g?.toString?.() === product?._id?.toString?.());

  const stockLeft = useMemo(() => {
    if (!product) return 0;
    if (product.variants?.length) {
      const v = product.variants[variantIdx];
      return v?.stock ?? 0;
    }
    return product.stock;
  }, [product, variantIdx]);

  const onReview = async (vals) => {
    await createReview({ productId: id, ...vals }).unwrap();
    reset();
    refetch();
  };

  const onWish = async () => {
    if (!product) return;
    if (isAuthenticated) await toggleWishlist(product._id).unwrap();
    else dispatch(guestToggleId(product._id));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">Product not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <ProductImageGallery images={product.images} name={product.name} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={product.ratings} showValue />
            <span className="text-sm text-slate-500">{product.numReviews} reviews</span>
          </div>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
            {product.comparePrice > product.price && (
              <p className="text-lg text-slate-400 line-through">{formatPrice(product.comparePrice)}</p>
            )}
            <Badge tone={stockLeft ? 'success' : 'danger'}>{stockLeft ? 'In stock' : 'Out of stock'}</Badge>
          </div>

          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-800">Variants</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setVariantIdx(idx)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-semibold',
                      variantIdx === idx
                        ? 'border-primary bg-indigo-50 text-primary'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                    ].join(' ')}
                  >
                    {[v.size, v.color].filter(Boolean).join(' · ') || 'Option'} ({v.stock})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-slate-800">
              Qty
              <input
                type="number"
                min={1}
                max={Math.max(1, stockLeft)}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="ml-3 w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="primary"
              disabled={!stockLeft}
              onClick={async () => {
                try {
                  await addItem(product, qty);
                } catch {
                  /* toast */
                }
              }}
            >
              Add to cart
            </Button>
            <Button variant="outline" onClick={onWish}>
              {wishlisted ? 'Saved' : 'Wishlist'}
            </Button>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6">
            <div className="flex gap-4 border-b border-slate-100">
              {['details', 'specs', 'reviews'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={[
                    '-mb-px border-b-2 px-2 pb-3 text-sm font-semibold capitalize',
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm leading-relaxed text-slate-700">
              {tab === 'details' && <p>{product.description}</p>}
              {tab === 'specs' && (
                <ul className="list-disc space-y-2 pl-5">
                  <li>Category: {product.category}</li>
                  <li>Brand: {product.brand}</li>
                  <li>SKU: {product.slug}</li>
                  <li>Stock: {product.stock}</li>
                </ul>
              )}
              {tab === 'reviews' && (
                <div className="space-y-6">
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmit(onReview)} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-900">Write a review</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Rating (1-5)"
                          type="number"
                          min={1}
                          max={5}
                          error={errors.rating?.message}
                          {...register('rating', { valueAsNumber: true })}
                        />
                        <Input label="Title (optional)" error={errors.title?.message} {...register('title')} />
                      </div>
                      <div className="mt-3">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Comment</label>
                        <textarea
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          {...register('comment')}
                        />
                        {errors.comment && (
                          <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>
                        )}
                      </div>
                      <Button type="submit" variant="primary" className="mt-3" disabled={reviewBusy}>
                        {reviewBusy ? 'Posting…' : 'Post review'}
                      </Button>
                    </form>
                  ) : (
                    <p className="text-sm text-slate-600">Sign in to leave a review.</p>
                  )}

                  <div className="space-y-4">
                    {reviews?.map((r) => (
                      <div key={r._id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{r.user?.name || 'Customer'}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <StarRating value={r.rating} />
                              <span className="text-xs text-slate-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {isAuthenticated &&
                            (user?._id === r.user?._id || user?.role === 'admin') && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="!text-red-600"
                                disabled={deleteBusy}
                                onClick={async () => {
                                  await removeReview(r._id).unwrap();
                                  refetch();
                                }}
                              >
                                Delete
                              </Button>
                            )}
                        </div>
                        {r.title && <p className="mt-2 text-sm font-semibold text-slate-800">{r.title}</p>}
                        <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
