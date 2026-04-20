import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import {
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from '../features/products/productsApi';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/ui/Button';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(params.get('keyword') || '');
  const debouncedKeyword = useDebounce(keywordInput, 400);

  const [category, setCategory] = useState(params.get('category') || '');
  const [brand, setBrand] = useState(params.get('brand') || '');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [rating, setRating] = useState(params.get('rating') || '');
  const [sort, setSort] = useState(params.get('sort') || '-createdAt');
  const [page, setPage] = useState(Number(params.get('page')) || 1);

  const { data: catData } = useGetCategoriesQuery();
  const { data: brandData } = useGetBrandsQuery();

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedKeyword) next.set('keyword', debouncedKeyword);
    if (category) next.set('category', category);
    if (brand) next.set('brand', brand);
    if (minPrice) next.set('minPrice', minPrice);
    if (maxPrice) next.set('maxPrice', maxPrice);
    if (rating) next.set('rating', rating);
    if (sort) next.set('sort', sort);
    if (page > 1) next.set('page', String(page));
    setParams(next, { replace: true });
  }, [debouncedKeyword, category, brand, minPrice, maxPrice, rating, sort, page, setParams]);

  const queryArgs = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      category: category || undefined,
      brand: brand || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      rating: rating || undefined,
      sort,
      page,
      limit: 12,
    }),
    [debouncedKeyword, category, brand, minPrice, maxPrice, rating, sort, page]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(queryArgs);

  const reset = () => {
    setKeywordInput('');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('-createdAt');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">All products</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Filter by category, brand, price, and rating. Results update as you type.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <ProductFilters
        keyword={keywordInput}
        onKeyword={setKeywordInput}
        category={category}
        onCategory={setCategory}
        brand={brand}
        onBrand={setBrand}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPrice={setMinPrice}
        onMaxPrice={setMaxPrice}
        rating={rating}
        onRating={setRating}
        sort={sort}
        onSort={setSort}
        categories={catData?.categories || []}
        brands={brandData?.brands || []}
        onReset={reset}
      />

      <div className="mt-8">
        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            Unable to load products. Verify MongoDB is running and the API is reachable.
          </div>
        )}
        <ProductGrid products={data?.products || []} loading={isLoading || isFetching} />
      </div>

      {data?.pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm font-semibold text-slate-700">
            Page {data.page} / {data.pages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
