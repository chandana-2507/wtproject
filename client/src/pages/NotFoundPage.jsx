import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm text-slate-600">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Link to="/">
        <Button variant="primary" className="mt-8">
          Back home
        </Button>
      </Link>
    </div>
  );
}
