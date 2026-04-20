import Breadcrumb from '../components/ui/Breadcrumb';
import ProductCard from '../components/product/ProductCard';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../features/auth/authApi';
import { useGetProductByIdQuery } from '../features/products/productsApi';
import Spinner from '../components/ui/Spinner';

function WishItem({ id }) {
  const { data, isLoading, isError } = useGetProductByIdQuery(id);

  if (isLoading) {
    return (
      <div className="h-[360px] animate-pulse rounded-xl bg-slate-100" />
    );
  }

  if (isError || !data?.product) return null;

  return <ProductCard product={data.product} />;
}

export default function WishlistPage() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const { data, isLoading } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const guestIds = useSelector((s) => s.wishlistLocal.guestIds);
  const user = data?.user;
  const wishlist = user?.wishlist || [];

  const ids = wishlist?.length
    ? wishlist.map((w) => (typeof w === 'string' ? w : w._id))
    : guestIds;

  if (isAuthenticated && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />

      <div className="mt-8">
        <h1 className="text-3xl font-bold text-slate-900">Wishlist</h1>
        <p className="mt-2 text-sm text-slate-600">Products you saved for later.</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ids?.length ? (
          ids.map((id) => <WishItem key={id.toString()} id={id.toString()} />)
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600">
            Your wishlist is empty.
          </div>
        )}
      </div>
    </div>
  );
}
