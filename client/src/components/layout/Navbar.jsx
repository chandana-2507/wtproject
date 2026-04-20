import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiShoppingCart, FiHeart, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CartDrawer from '../cart/CartDrawer';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState('');
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const guestWishlistIds = useSelector((s) => s.wishlistLocal.guestIds);
  const wishCount = isAuthenticated ? user?.wishlist?.length || 0 : guestWishlistIds.length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/products?keyword=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            <span className="text-primary">Luxe</span>Mart
          </Link>

          <form
            onSubmit={submitSearch}
            className="hidden flex-1 items-center gap-2 md:flex md:max-w-xl"
          >
            <div className="relative w-full">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands and more"
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="primary" className="whitespace-nowrap px-5">
              Search
            </Button>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              className="relative !p-2 md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <FiMenu className="h-6 w-6" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="relative !hidden p-2 md:!inline-flex"
              aria-label="Browse products"
              onClick={() => navigate('/products')}
            >
              <FiSearch className="h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="relative !p-2"
              aria-label="Wishlist"
              onClick={() => navigate('/wishlist')}
            >
              <FiHeart className="h-5 w-5 text-rose-500" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-bold text-white">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="relative !p-2"
              aria-label="Cart"
              onClick={() => setDrawerOpen(true)}
            >
              <FiShoppingCart className="h-5 w-5 text-primary" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <div className="relative ml-1" ref={menuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2 shadow-sm"
                  onClick={() => setUserMenu((v) => !v)}
                  aria-expanded={userMenu}
                >
                  <img
                    src={
                      user?.avatar?.url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`
                    }
                    alt=""
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                  />
                  <span className="hidden max-w-[7rem] truncate text-sm font-medium text-slate-800 lg:inline">
                    {user?.name}
                  </span>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg">
                    <NavLink
                      to="/profile"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenu(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/orders"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenu(false)}
                    >
                      Orders
                    </NavLink>
                    <NavLink
                      to="/wishlist"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenu(false)}
                    >
                      Wishlist
                    </NavLink>
                    <NavLink
                      to="/addresses"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenu(false)}
                    >
                      Addresses
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        className="block px-4 py-2 font-semibold text-primary hover:bg-indigo-50"
                        onClick={() => setUserMenu(false)}
                      >
                        Admin
                      </NavLink>
                    )}
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setUserMenu(false);
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button type="button" variant="primary" className="!px-4 !py-2 text-sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/95 md:hidden">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="!py-2"
            />
            <Button type="submit" variant="primary" className="!px-3">
              Go
            </Button>
          </form>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[90] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute left-0 top-0 flex h-full w-[min(88vw,20rem)] flex-col bg-white p-4 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-2 text-sm font-medium">
                <Link
                  to="/"
                  className="rounded-lg px-2 py-2 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="rounded-lg px-2 py-2 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  className="rounded-lg px-2 py-2 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Cart
                </Link>
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      className="rounded-lg px-2 py-2 hover:bg-slate-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-lg px-2 py-2 hover:bg-slate-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="rounded-lg px-2 py-2 font-semibold text-primary hover:bg-indigo-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
