import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';
import { toSlug } from '../utils/categorySlug';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { data: categories = [] } = useCategories();

    return (
        <footer className="bg-dark-900 pt-16 pb-8 border-t border-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    <div>
                        <h2 className="text-3xl font-serif text-white mb-6">Sela</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Curated elegance for your everyday life. Discover premium products carefully selected for quality, design, and sophisticated living.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium uppercase tracking-wider text-sm mb-6">Explore</h3>
                        <nav aria-label="Footer navigation">
                            <ul className="space-y-4">
                                <li><Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">Home</Link></li>
                                {categories.map((name) => (
                                    <li key={name}>
                                        <Link to={`/category/${toSlug(name)}`} className="text-slate-400 hover:text-white transition-colors text-sm">{name}</Link>
                                    </li>
                                ))}
                                {categories.length === 0 && (
                                    <li><Link to="/search" className="text-slate-400 hover:text-white transition-colors text-sm">All Products</Link></li>
                                )}
                            </ul>
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-white font-medium uppercase tracking-wider text-sm mb-6">Connect</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Instagram</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Pinterest</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Twitter</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-dark-800 pt-8 mt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-4">
                    <p className="text-slate-500 text-xs">
                        &copy; {currentYear} Sela Store. All rights reserved.
                    </p>

                    {/* Mandatory Amazon Associate Disclaimer */}
                    <p className="text-slate-500 text-xs max-w-xl text-center md:text-right italic">
                        "As an Amazon Associate I earn from qualifying purchases." Sela Store is a participant in the Amazon Services LLC Associates Program.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
