import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCpu,
  FiSun,
  FiHome,
  FiActivity,
  FiHeart,
  FiBookOpen,
  FiArrowRight,
} from 'react-icons/fi';
import Button from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';
import {
  useGetFeaturedProductsQuery,
  useGetProductsQuery,
} from '../features/products/productsApi';

const cats = [
  { id: 'Electronics', label: 'Electronics', icon: FiCpu },
  { id: 'Fashion', label: 'Fashion', icon: FiSun },
  { id: 'Home', label: 'Home', icon: FiHome },
  { id: 'Sports', label: 'Sports', icon: FiActivity },
  { id: 'Beauty', label: 'Beauty', icon: FiHeart },
  { id: 'Books', label: 'Books', icon: FiBookOpen },
];

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, done: diff === 0 };
}

export default function Home() {
  const { data: feat, isLoading: featLoad, isError: featErr } = useGetFeaturedProductsQuery();
  const { data: latest, isLoading: newLoad } = useGetProductsQuery({ limit: 8, sort: '-createdAt' });
  const { data: dealsData } = useGetProductsQuery({
    limit: 6,
    sort: '-comparePrice',
  });

  const endOfDay = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  const countdown = useCountdown(endOfDay);

  const saleProducts =
    dealsData?.products?.filter((p) => (p.comparePrice || 0) > (p.price || 0)).slice(0, 6) ||
    [];

  const newsletterSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-indigo-700 via-primary to-indigo-900 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
            <p className="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              Spring specials live now
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
              Elevated essentials for everyday life.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-indigo-100">
              Thoughtfully curated electronics, fashion, home goods, and more—with secure checkout,
              tracked delivery, and member perks.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button variant="secondary" className="!bg-white !text-primary hover:!bg-slate-100">
                  Shop collection
                </Button>
              </Link>
              <Link to="/products?sort=-ratings">
                <Button variant="outline" className="!border-white/60 !bg-transparent !text-white hover:!bg-white/10">
                  Top rated picks
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative mx-auto max-w-lg"
          >
            <div className="aspect-[5/4] rounded-3xl bg-white/10 p-6 shadow-2xl ring-1 ring-white/20 backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e3685b?auto=format&fit=crop&w=900&q=80"
                alt="Shopping"
                className="h-full w-full rounded-2xl object-cover shadow-inner"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Browse by category</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Find your next favorite</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-semibold text-primary hover:text-indigo-700 sm:inline-flex">
            View all <FiArrowRight className="ml-1 inline" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(c.id)}`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-primary ring-1 ring-indigo-100 transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                    <p className="text-xs text-slate-500">Explore best sellers</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Spotlight</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Featured products</h2>
            </div>
            <Link to="/products?sort=-ratings" className="text-sm font-semibold text-primary hover:text-indigo-700">
              Browse catalog
            </Link>
          </div>
          {featErr && (
            <p className="text-sm text-red-600">Unable to load featured products. Is the API running?</p>
          )}
          {featLoad && <ProductGrid loading />}
          {!featLoad && !featErr && (
            <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
              {(feat?.products || []).map((p) => (
                <div key={p._id} className="w-[220px] shrink-0 sm:w-[240px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-white to-indigo-50 p-8 shadow-inner ring-1 ring-amber-100">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Deals end at midnight</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Today’s limited offers</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Secure the best prices on top-rated gear before the timer hits zero.
              </p>
              <div className="mt-6 grid max-w-xs grid-cols-3 gap-3 text-center">
                {['h', 'm', 's'].map((k, i) => (
                  <div key={k} className="rounded-xl border border-amber-100 bg-white px-3 py-3 shadow-sm">
                    <p className="text-2xl font-black text-primary">
                      {i === 0 ? countdown.h : i === 1 ? countdown.m : countdown.s}
                    </p>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      {i === 0 ? 'Hours' : i === 1 ? 'Minutes' : 'Seconds'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {saleProducts.map((p) => (
                <motion.div key={p._id} layout className="h-full">
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 md:flex-row md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Members save more</p>
            <h2 className="mt-2 text-3xl font-bold">Join LuxeMart rewards</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Unlock exclusive drops, birthday perks, and faster checkout when you shop with us.
            </p>
          </div>
          <Link to="/register">
            <Button variant="secondary" className="!px-8">
              Join free
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Fresh drops</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">New arrivals</h2>
          </div>
          <Link to="/products?sort=-createdAt" className="text-sm font-semibold text-primary hover:text-indigo-700">
            Shop all new
          </Link>
        </div>
        {newLoad ? (
          <ProductGrid loading />
        ) : (
          <ProductGrid products={latest?.products || []} />
        )}
      </section>

      <section className="border-t border-slate-100 bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Stay in the loop</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Newsletter</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Product launches, styling guides, and member-only discounts—once a week, no spam.
          </p>
          <form onSubmit={newsletterSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              required
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <Button type="submit" variant="primary" className="sm:!px-8">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
