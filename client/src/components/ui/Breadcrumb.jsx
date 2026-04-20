import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, idx) => (
        <span key={item.label + idx} className="flex items-center gap-2">
          {idx > 0 && <FiChevronRight className="text-slate-400" />}
          {item.href && idx < items.length - 1 ? (
            <Link to={item.href} className="font-medium text-primary hover:text-indigo-700">
              {item.label}
            </Link>
          ) : (
            <span className={idx === items.length - 1 ? 'font-semibold text-slate-800' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
