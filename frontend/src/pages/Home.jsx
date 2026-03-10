import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const { data: productsData, isLoading, error } = useProducts({ isFeatured: 'true' });
    const products = productsData?.products || [];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-slate-100 dark:bg-dark-950 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-multiply dark:opacity-5"></div>
                <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 dark:from-dark-950/40 to-slate-50/90 dark:to-dark-950/90"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 text-center px-4 max-w-3xl mx-auto"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 1 }}
                        className="text-brand-600 font-semibold tracking-widest uppercase text-sm mb-4 block"
                    >
                        Welcome to Sela Store
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif text-dark-900 dark:text-slate-100 mb-6 leading-tight"
                    >
                        Elevate Your <br />
                        <span className="italic font-light text-brand-700">Everyday</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto font-light"
                    >
                        Discover our curated collection of premium tech, home essentials, and lifestyle accessories designed for modern living.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="flex justify-center space-x-4"
                    >
                        <Link to="/search" className="bg-dark-900 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-600 transition-all shadow-lg hover:shadow-brand-500/30 flex items-center space-x-2">
                            <span>Shop Collection</span> <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
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
        </div>
    );
};

export default Home;
