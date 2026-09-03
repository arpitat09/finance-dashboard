import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="grid-overlay" />

      <div className="card max-w-md p-8 shadow-2xl relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-extrabold text-2xl font-heading mb-4 shadow-sm">
          404
        </div>

        <h2 className="text-xl font-bold font-heading text-[var(--fg)] mb-1">
          Page Not Found
        </h2>
        <p className="text-xs text-[var(--fg-muted)] mb-6 leading-relaxed">
          The page or resource you're looking for does not exist or has been moved.
        </p>

        <Link to="/dashboard" className="btn-primary w-full py-2.5 text-xs">
          <LayoutDashboard size={15} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
