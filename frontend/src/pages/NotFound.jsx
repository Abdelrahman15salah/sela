import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-8xl font-serif text-brand-200 mb-4">404</h1>
        <h2 className="text-2xl font-serif text-dark-900 mb-4">Page not found</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition-colors"
        >
            <FiHome /> Back to Home
        </Link>
    </div>
);

export default NotFound;
