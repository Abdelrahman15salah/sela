import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import CategorySection from '../components/CategorySection';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const { data: productsData, isLoading, error } = useProducts({ isFeatured: 'true' });
    const { data: categories } = useCategories();
    const products = productsData?.products || [];

    // Prioritize certain categories or just take the first few
    const prioritizedCategories = ['Mobiles', 'Tech', 'Home', 'Style'];
    const homeCategories = categories 
        ? [...new Set([...prioritizedCategories.filter(c => categories.includes(c)), ...categories])].slice(0, 4)
        : [];

    return (
        <div className="animate-fade-in relative overflow-hidden">
            {/* Global Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] -left-[10%] w-[40%] aspect-square bg-brand-200/20 dark:bg-brand-900/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[20%] -right-[10%] w-[35%] aspect-square bg-slate-200/30 dark:bg-dark-800/20 rounded-full blur-[130px]" />
            </div>

            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center bg-slate-100 dark:bg-dark-950 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-multiply dark:opacity-5"></div>
                
                {/* Hero Specific Gradients */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-transparent via-slate-50/80 dark:via-dark-950/80 to-slate-50 dark:to-dark-950"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-200/40 dark:bg-brand-900/20 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-200/50 dark:bg-dark-800/30 rounded-full blur-[100px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 text-center px-4 max-w-4xl mx-auto"
                >
                    <motion.span
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.4em" }}
                        transition={{ delay: 0.2, duration: 1.2 }}
                        className="text-brand-600 font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block"
                    >
                        The Art of Curation
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="text-6xl md:text-8xl font-serif text-dark-900 dark:text-slate-100 mb-8 leading-[1.1] tracking-tight"
                    >
                        Elevate Your <br />
                        <span className="italic font-light text-brand-700 dark:text-brand-500">Everyday</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Discover our curated collection of premium tech, home essentials, and lifestyle accessories designed for modern living.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 1 }}
                        className="flex justify-center space-x-6"
                    >
                        <Link to="/search" className="group bg-dark-900 dark:bg-brand-600 text-white px-10 py-5 rounded-full font-medium hover:bg-brand-600 dark:hover:bg-brand-500 transition-all shadow-2xl hover:shadow-brand-500/40 flex items-center space-x-3">
                            <span>Shop Collection</span> 
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Featured Products Section */}
            <section className="py-24 bg-slate-50 dark:bg-dark-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif text-dark-900 dark:text-slate-100 mb-4 tracking-tight">Curated Selection</h2>
                        <div className="w-16 h-1 bg-brand-400 mx-auto rounded-full"></div>
                        <p className="text-slate-500 dark:text-slate-400 mt-6 max-w-xl mx-auto text-lg">
                            Hand-picked items that blend exceptional functionality with unmatched aesthetic appeal.
                        </p>
                    </motion.div>

                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                            <p>Failed to load products. Please try again later.</p>
                        </div>
                    )}

                    {!isLoading && !error && products?.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-800">
                            <p className="text-slate-500 dark:text-slate-400 text-lg">No authentic products found yet. Check back soon!</p>
                        </div>
                    )}

                    {products && products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Categorized Sections */}
            {!isLoading && homeCategories.map((cat, index) => (
                <CategorySection key={cat} category={cat} index={index} />
            ))}
        </div>
    );
};

export default Home;
