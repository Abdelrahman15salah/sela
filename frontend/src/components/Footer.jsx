import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';
import { toSlug } from '../utils/categorySlug';
import { FiInstagram, FiArrowRight } from 'react-icons/fi';
import { RiPinterestLine, RiTwitterXLine } from 'react-icons/ri';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { data: categories = [] } = useCategories();

    return (
        <footer className="bg-dark-950 border-t border-dark-800/60 pt-14 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top grid */}
                <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-12 pb-12 border-b border-dark-800/60">

                    {/* Brand */}
                    <div>
                        <h2 className="font-serif text-3xl font-medium text-white tracking-tight mb-3">
                            Sela<span className="text-brand-500">.</span>
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
                            Curated elegance for your everyday life. Premium products selected for quality, design, and sophisticated living.
                        </p>
                        <div className="flex items-center gap-2">
                            {[
                                { icon: FiInstagram, label: 'Instagram' },
                                { icon: RiPinterestLine, label: 'Pinterest' },
                                { icon: RiTwitterXLine, label: 'Twitter' },
                            ].map(({ icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-dark-700 text-slate-500 hover:text-slate-300 hover:border-dark-600 hover:bg-dark-800 transition-all"
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-5">Explore</p>
                        <nav aria-label="Footer explore navigation">
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/" className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors">
                                        Home
                                        <FiArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </li>
                                {categories.length > 0
                                    ? categories.map(name => (
                                        <li key={name}>
                                            <Link
                                                to={`/category/${toSlug(name)}`}
                                                className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors"
                                            >
                                                {name}
                                                <FiArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </Link>
                                        </li>
                                    ))
                                    : (
                                        <li>
                                            <Link to="/search" className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors">
                                                All Products
                                                <FiArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </Link>
                                        </li>
                                    )
                                }
                            </ul>
                        </nav>
                    </div>

                    {/* Connect */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-5">Connect</p>
                        <ul className="space-y-3">
                            {['Instagram', 'Pinterest', 'Twitter'].map(name => (
                                <li key={name}>
                                    <a href="#" className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors">
                                        {name}
                                        <FiArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600 order-2 md:order-1">
                        &copy; {currentYear} Sela Store. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-600 max-w-md text-center md:text-right leading-relaxed italic order-1 md:order-2">
                        As an <span className="text-brand-500/80 not-italic">Amazon Associate</span> I earn from qualifying purchases.
                        Sela Store participates in the Amazon Services LLC Associates Program.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;