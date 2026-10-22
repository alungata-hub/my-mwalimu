import { Compass, ArrowLeft } from 'lucide-react';
import { navigate } from '@/lib/router';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary-600">
        <Compass className="w-8 h-8" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 text-ink-500 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <button onClick={() => navigate('#/dashboard')} className="btn-primary mt-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>
    </div>
  );
}
