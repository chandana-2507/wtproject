import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiBox, FiLayout, FiPercent, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
    isActive ? 'bg-indigo-50 text-primary' : 'text-slate-600 hover:bg-slate-100',
  ].join(' ');

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{user?.name}</p>
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink to="/admin" end className={linkClass}>
              <FiLayout /> Dashboard
            </NavLink>
            <NavLink to="/admin/products" className={linkClass}>
              <FiBox /> Products
            </NavLink>
            <NavLink to="/admin/orders" className={linkClass}>
              <FiShoppingBag /> Orders
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              <FiUsers /> Users
            </NavLink>
            <NavLink to="/admin/coupons" className={linkClass}>
              <FiPercent /> Coupons
            </NavLink>
          </nav>
          <div className="mt-auto border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </Button>
            <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => navigate('/')}>
              Back to store
            </Button>
          </div>
        </aside>

        <main className="min-h-[70vh] flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
