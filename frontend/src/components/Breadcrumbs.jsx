import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumbs = ({ items = [] }) => {
    return (
        <nav className="flex mb-6 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm font-medium whitespace-nowrap">
                <li>
                    <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors flex items-center">
                        <FiHome className="flex-shrink-0 mr-1.5 h-4 w-4" aria-hidden="true" />
                        <span>Home</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <FiChevronRight className="flex-shrink-0 h-4 w-4 text-slate-400 dark:text-slate-600" aria-hidden="true" />
                        <Link
                            to={item.path}
                            className={`ml-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors ${index === items.length - 1 ? 'font-semibold text-slate-800 dark:text-slate-200' : ''
                                }`}
                            aria-current={index === items.length - 1 ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
