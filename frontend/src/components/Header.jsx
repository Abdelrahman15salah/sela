import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';
import { toSlug } from '../utils/categorySlug';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { data: categories = [] } = useCategories();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsMobileOpen(false);
        }
    };

    return (
        <header className="glass sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                        <span className="font-serif text-3xl font-bold tracking-tight text-gradient">Sela</span>
                        <span className="hidden sm:block text-xs uppercase tracking-widest text-slate-500 font-medium mt-2">Store</span>
                    </Link>

                    <nav className="hidden md:flex gap-8" aria-label="Main navigation">
                        <Link to="/" className="relative text-slate-600 hover:text-brand-600 font-medium transition-colors group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        {categories.map((name, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i, duration: 0.3 }}
                            >
                                <Link to={`/category/${toSlug(name)}`} className="relative text-slate-600 hover:text-brand-600 font-medium transition-colors group">
                                    {name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="hidden lg:flex relative" role="search">
                            <label htmlFor="search" className="sr-only">Search products</label>
                            <input
                                id="search"
                                type="search"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-100 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 w-64 transition-all focus:w-72"
                            />
                            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-brand-600" aria-label="Search">
                                <FiSearch />
                            </button>
                        </form>

                        <button
                            type="button"
                            className="md:hidden text-slate-600 hover:text-brand-600 p-2"
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            aria-expanded={isMobileOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileOpen && (
                <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg">
                    <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2" aria-label="Mobile navigation">
                        <Link to="/" className="block py-2 text-slate-600 hover:text-brand-600 font-medium" onClick={() => setIsMobileOpen(false)}>Home</Link>
                        {categories.map((name) => (
                            <Link key={name} to={`/category/${toSlug(name)}`} className="block py-2 text-slate-600 hover:text-brand-600 font-medium" onClick={() => setIsMobileOpen(false)}>
                                {name}
                            </Link>
                        ))}
                        <form onSubmit={handleSearch} className="pt-4">
                            <input
                                type="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-100 rounded-full py-2 px-4 text-sm"
                            />
                        </form>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
