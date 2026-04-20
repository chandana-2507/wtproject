import { useMemo } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ProductFilters({
  keyword,
  onKeyword,
  category,
  onCategory,
  brand,
  onBrand,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  rating,
  onRating,
  sort,
  onSort,
  categories = [],
  brands = [],
  onReset,
}) {
  const safeBrands = useMemo(() => brands.filter(Boolean), [brands]);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[10rem] flex-1">
          <Input label="Search" value={keyword} onChange={(e) => onKeyword(e.target.value)} placeholder="Keyword" />
        </div>
        <div className="min-w-[9rem]">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={category}
            onChange={(e) => onCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[9rem]">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Brand</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={brand}
            onChange={(e) => onBrand(e.target.value)}
          >
            <option value="">All</option>
            {safeBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[8rem] flex-col">
          <Input
            label="Min price"
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPrice(e.target.value)}
          />
        </div>
        <div className="flex min-w-[8rem] flex-col">
          <Input
            label="Max price"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPrice(e.target.value)}
          />
        </div>
        <div className="min-w-[9rem]">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Min rating</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            value={rating}
            onChange={(e) => onRating(e.target.value)}
          >
            <option value="">Any</option>
            <option value="4">4+</option>
            <option value="3">3+</option>
            <option value="2">2+</option>
          </select>
        </div>
        <div className="min-w-[11rem]">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Sort</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
          >
            <option value="-createdAt">Newest</option>
            <option value="price">Price: low to high</option>
            <option value="-price">Price: high to low</option>
            <option value="-ratings">Top rated</option>
          </select>
        </div>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
