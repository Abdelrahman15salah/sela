import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';
import { toSlug } from '../utils/categorySlug';
import {
    FiSearch, FiMenu, FiX, FiSun, FiMoon, FiHeart,
    FiChevronDown, FiArrowRight, FiMonitor, FiWatch,
    FiShoppingBag, FiUser, FiTag
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';

const CATEGORY_META = {
    'electronics':        { icon: FiMonitor,     previews: ['Headphones', 'Smart watches', 'Laptops'] },
    "men's clothing":     { icon: FiUser,         previews: ['Slim-fit shirts', 'Chinos', 'Jackets'] },
    "women's clothing":   { icon: FiShoppingBag,  previews: ['Summer dresses', 'Blouses', 'Skirts'] },
    'jewelery':           { icon: FiWatch,         previews: ['Gold necklaces', 'Bracelets', 'Rings'] },
};

const getCategoryMeta = (name) => {
    const key = name.toLowerCase();
    for (const [k, meta] of Object.entries(CATEGORY_META)) {
        if (key.includes(k)) return meta;
    }
    return { icon: FiTag, previews: [] };
};

const Drawer = ({ categories, onClose }) => {
    const [search, setSearch] = useState('');
    const [hovered, setHovered] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const filtered = search.trim()
        ? categories.filter(c => c.toLowerCase().includes(search.toLowerCase()))
        : categories;

    return (
        <motion.div
            className="fixed inset-y-0 right-0 z-[100] w-80 bg-white dark:bg-dark-900 flex flex-col border-l border-slate-100 dark:border-dark-800 shadow-2xl shadow-slate-900/10"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Browse categories"
        >
            {/* Header */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-start justify-between mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Shop by
                    </p>
                    <button
                        onClick={onClose}
                        className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                        aria-label="Close drawer"
                    >
                        <FiX size={15} />
                    </button>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-slate-800 dark:text-white mb-4">
                    Collections
                </h2>

                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={13} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-dark-800 dark:text-slate-200 dark:placeholder-slate-600 text-sm border border-slate-100 dark:border-dark-700 rounded-xl py-2.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-brand-300 dark:focus:ring-brand-700 transition"
                    />
                </div>
            </div>

            {/* Count */}
            <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                {filtered.length} {filtered.length === 1 ? 'category' : 'categories'}
            </p>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                <AnimatePresence>
                    {filtered.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No matches found</p>
                    ) : filtered.map((name, i) => {
                        const { icon: Icon, previews } = getCategoryMeta(name);
                        return (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.22 }}
                                className="relative group"
                                onMouseEnter={() => setHovered(name)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <Link
                                    to={`/category/${toSlug(name)}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800/60 border border-transparent hover:border-slate-100 dark:hover:border-dark-700 transition-all"
                                >
                                    <span className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 dark:group-hover:bg-violet-900/30 dark:group-hover:text-violet-400 transition-colors">
                                        <Icon size={15} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{name}</span>
                                    </span>
                                    <FiArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                                </Link>

                                {/* Hover preview tooltip */}
                                {previews.length > 0 && hovered === name && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 6 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-[calc(100%+8px)] top-1 z-10 w-44 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-xl p-3 pointer-events-none shadow-lg shadow-slate-900/5"
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Popular</p>
                                        <ul className="space-y-1.5">
                                            {previews.map(p => (
                                                <li key={p} className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-50 dark:border-dark-800 pb-1.5 last:border-0 last:pb-0">{p}</li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-50 dark:border-dark-800">
                <Link
                    to="/products"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-dark-700 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-all"
                >
                    View all products <FiArrowRight size={13} />
                </Link>
            </div>
        </motion.div>
    );
};

const Header = () => {
    const [searchTerm, setSearchTerm]         = useState('');
    const [isMobileOpen, setIsMobileOpen]     = useState(false);
    const [isDrawerOpen, setIsDrawerOpen]     = useState(false);
    const navigate = useNavigate();
    const { data: categories = [] } = useCategories();
    const { isDark, toggle }        = useTheme();
    const { wishlist }              = useWishlist();

    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isDrawerOpen]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setIsDrawerOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsMobileOpen(false);
        }
    };

    return (
        <>
        <header className="glass dark:bg-dark-900/80 dark:border-dark-800/50 sticky top-0 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                        <span className="font-serif text-3xl font-bold tracking-tight text-gradient">Sela</span>
                        <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium mt-2">Store</span>
                    </Link>

                    <nav className="hidden md:flex gap-8 items-center" aria-label="Main navigation">
                        <Link to="/" className="relative text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium transition-colors group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full" />
                        </Link>
                        {categories.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(true)}
                                className="relative text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium transition-colors flex items-center gap-1 group py-2"
                            >
                                Categories
                                <FiChevronDown size={14} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full" />
                            </button>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="hidden lg:flex relative" role="search">
                            <label htmlFor="search" className="sr-only">Search products</label>
                            <input
                                id="search" type="search" placeholder="Search products..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-slate-100 dark:bg-dark-800 dark:text-slate-200 dark:placeholder-slate-500 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 w-64 transition-all focus:w-72"
                            />
                            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-brand-600" aria-label="Search">
                                <FiSearch />
                            </button>
                        </form>

                        <Link to="/wishlist" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors relative" aria-label="Wishlist">
                            <FiHeart size={20} className={wishlist.length > 0 ? 'fill-brand-500 text-brand-500' : ''} />
                            {wishlist.length > 0 && (
                                <span className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        <button type="button" onClick={toggle}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
                            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>

                        <button type="button"
                            className="md:hidden text-slate-600 dark:text-slate-300 hover:text-brand-600 p-2"
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            aria-expanded={isMobileOpen} aria-controls="mobile-menu">
                            {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileOpen && (
                <div id="mobile-menu" className="border-t border-slate-200 dark:border-dark-800 bg-white/95 dark:bg-dark-950/95 backdrop-blur-lg">
                    <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2" aria-label="Mobile navigation">
                        <Link to="/" className="block py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 font-medium" onClick={() => setIsMobileOpen(false)}>Home</Link>
                        {categories.length > 0 && (
                            <div className="py-2 border-t border-slate-100 dark:border-dark-800">
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold px-2">Categories</p>
                                <div className="max-h-64 overflow-y-auto space-y-1">
                                    {categories.map(name => (
                                        <Link key={name} to={`/category/${toSlug(name)}`}
                                            className="block py-2.5 px-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-brand-600 font-medium text-sm transition-colors"
                                            onClick={() => setIsMobileOpen(false)}>
                                            {name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSearch} className="pt-4">
                            <input type="search" placeholder="Search..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-dark-800 dark:text-slate-200 rounded-full py-2 px-4 text-sm" />
                        </form>
                    </nav>
                </div>
            )}
        </header>

        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[99] bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setIsDrawerOpen(false)}
                        aria-hidden="true"
                    />
                    <Drawer categories={categories} onClose={() => setIsDrawerOpen(false)} />
                </>
            )}
        </AnimatePresence>
        </>
    );
};

export default Header;