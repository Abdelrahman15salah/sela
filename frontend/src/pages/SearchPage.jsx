import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data: products, isLoading, error } = useProducts({ search: query });

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
            <section className="bg-white border-b border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-medium text-brand-600 mb-2 tracking-widest uppercase">Search Results</p>
                    <h1 className="text-3xl md:text-4xl font-serif text-dark-900">
                        {query ? `Showing results for "${query}"` : 'All Products'}
                    </h1>
                    {products && !isLoading && !error && (
                        <p className="text-slate-500 mt-2">{products.length} {products.length === 1 ? 'item' : 'items'} found</p>
                    )}
                </div>
            </section>

            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-500 bg-red-50 rounded-2xl">
                        <p>Failed to load search results. Please try again later.</p>
                    </div>
                )}

                {!isLoading && !error && products?.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-serif text-dark-800 mb-2">No matching products</h3>
                        <p className="text-slate-500 text-md">Try searching for something else like "laptop", "decor", etc.</p>
                    </div>
                )}

                {products && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default SearchPage;
