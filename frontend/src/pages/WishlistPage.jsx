import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const WishlistPage = () => {
    const { wishlist } = useWishlist();

    return (
        <div className="animate-fade-in bg-slate-50 dark:bg-dark-950 min-h-screen pb-20">
            <section className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-dark-900 dark:text-slate-100 mb-4">
                        My Wishlist
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Your personal collection of curated finds. These items are saved to your browser and will be here when you return.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Breadcrumbs items={[{ label: 'Wishlist', path: '/wishlist' }]} />

                {wishlist.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-800">
                        <div className="text-slate-300 dark:text-dark-700 mb-4 text-6xl">❤️</div>
                        <h3 className="text-xl font-serif text-dark-800 dark:text-slate-200 mb-2">Your wishlist is empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-md mb-8">
                            Start adding products you love to see them here!
                        </p>
                        <a href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20">
                            Explore Products
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id || product.asin} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
