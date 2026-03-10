import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategorySection = ({ category, index }) => {
    const { data: productsData, isLoading, error } = useProducts({ 
        category, 
        limit: 4,
        sortBy: 'createdAt' 
    });
    
    const products = productsData?.products || [];
    const isEven = index % 2 === 0;

    // Helper to get category descriptions
    const getCategoryDetails = (cat) => {
        const details = {
            'Mobiles': 'The latest smartphones and accessories selected for performance and style.',
            'Tech': 'Cutting-edge gadgets and computing essentials for your digital lifestyle.',
            'Home': 'Beautifully designed pieces to make your living space truly yours.',
            'Style': 'Elevated fashion and lifestyle pieces that define your unique look.',
            'Gaming': 'High-performance gear and immersive accessories for serious gamers.',
            'Beauty': 'Premium skincare and beauty essentials for a refined routine.'
        };
        return details[cat] || `Explore our curated selection of premium ${cat.toLowerCase()} products.`;
    };

    if (!isLoading && products.length === 0) return null;

    return (
        <section 
            id={category.toLowerCase().replace(/\s+/g, '-')}
            className={`relative py-24 border-t border-slate-100 dark:border-dark-800 transition-colors duration-500 overflow-hidden ${
                isEven ? 'bg-white dark:bg-dark-950' : 'bg-slate-50/50 dark:bg-dark-900/40'
            }`}
        >
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div 
                    className={`absolute -top-[10%] ${isEven ? '-right-[5%]' : '-left-[5%]'} w-[40%] aspect-square rounded-full blur-[120px] opacity-[0.08] dark:opacity-[0.12] transition-colors duration-1000 ${
                        isEven ? 'bg-brand-500' : 'bg-brand-400'
                    }`}
                />
                <div 
                    className={`absolute -bottom-[10%] ${isEven ? '-left-[5%]' : '-right-[5%]'} w-[30%] aspect-square rounded-full blur-[100px] opacity-[0.05] dark:opacity-[0.08] transition-colors duration-1000 ${
                        isEven ? 'bg-slate-400' : 'bg-brand-300'
                    }`}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-brand-500 uppercase px-2 py-1 rounded bg-brand-500/10 border border-brand-500/20">
                                {category}
                            </span>
                            <div className="h-[1px] w-8 bg-brand-200 dark:bg-dark-700"></div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-dark-900 dark:text-slate-100 mb-4 tracking-tight">
                            The <span className="italic font-light text-brand-700 dark:text-brand-400">{category}</span> Collection
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-light leading-relaxed">
                            {getCategoryDetails(category)}
                        </p>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <Link 
                            to={`/search?category=${encodeURIComponent(category)}`}
                            className="group flex items-center space-x-3 bg-dark-900 dark:bg-dark-800 text-white dark:text-slate-200 px-6 py-3 rounded-full font-medium hover:bg-brand-600 dark:hover:bg-brand-600 transition-all shadow-lg hover:shadow-brand-500/20"
                        >
                            <span className="text-sm">Explore All</span>
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                        <p className="text-red-600 dark:text-red-400 font-light italic">Failed to load this collection. Please try again soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategorySection;
