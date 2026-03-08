import { useParams } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import { toSlug } from '../utils/categorySlug';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

const CategoryPage = () => {
    const { slug } = useParams();
    const { data: categories = [] } = useCategories();
    const currentCategory = categories.find((c) => toSlug(c) === slug);

    const { data: products, isLoading, error } = useProducts({ category: slug });

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
            {/* Category Header */}
            <section className="bg-white border-b border-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-dark-900 mb-4 capitalize">
                        {currentCategory || slug.replace(/-/g, ' ')}
                    </h1>
                </div>
            </section>

            {/* Product Grid */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-500 bg-red-50 rounded-2xl">
                        <p>Failed to load products for this category. Please try again later.</p>
                    </div>
                )}

                {!isLoading && !error && products?.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-slate-300 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif text-dark-800 mb-2">No items found</h3>
                        <p className="text-slate-500 text-md">We're currently curating more items for this category.</p>
                    </div>
                )}

                {products && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default CategoryPage;
