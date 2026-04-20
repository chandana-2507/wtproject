import { Link } from 'react-router-dom';
import { FiGithub, FiInstagram, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="text-xl font-bold text-slate-900">
            <span className="text-primary">Luxe</span>Mart
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
            Premium essentials with thoughtful design. Fast shipping, secure checkout, and human support.
          </p>
          <div className="mt-4 flex gap-3 text-slate-500">
            <a href="#" className="rounded-full border border-slate-200 p-2 hover:bg-slate-50" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#" className="rounded-full border border-slate-200 p-2 hover:bg-slate-50" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="#" className="rounded-full border border-slate-200 p-2 hover:bg-slate-50" aria-label="GitHub">
              <FiGithub />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">Shop</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/products" className="hover:text-primary">
                All products
              </Link>
            </li>
            <li>
              <Link to="/products?category=Electronics" className="hover:text-primary">
                Electronics
              </Link>
            </li>
            <li>
              <Link to="/products?category=Fashion" className="hover:text-primary">
                Fashion
              </Link>
            </li>
            <li>
              <Link to="/products?category=Home" className="hover:text-primary">
                Home
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">Support</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <a href="mailto:support@luxemart.com" className="hover:text-primary">
                Contact
              </a>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                Order status
              </Link>
            </li>
            <li>
              <span>Returns within 30 days</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">Newsletter</h3>
          <p className="text-sm text-slate-600">Get product drops and member-only offers.</p>
          <form
            className="mt-3 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} LuxeMart. All rights reserved.
      </div>
    </footer>
  );
}
