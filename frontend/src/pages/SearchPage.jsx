import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import PriceRangeFilter from '../components/PriceRangeFilter';
import Pagination from '../components/Pagination';

const extractPrice = (product) => {
    const p = product.isOnSale && typeof product.salePrice === 'number'
        ? product.salePrice
        : product.price;
    if (typeof p === 'number') return p;
    if (p?.amount) return p.amount;
    if (p?.displayPrice) {
        const num = parseFloat(p.displayPrice.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? null : num;
    }
    return null;
};

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [page, setPage] = useState(1);
    const limit = 12;

    const { data: productsData, isLoading, error } = useProducts({ search: query, page, limit });
    const products = productsData?.products || [];
    const pagination = productsData?.pagination || null;

    const [priceMin, setPriceMin] = useState(null);
    const [priceMax, setPriceMax] = useState(null);

    // Reset pagination and filters on search change
    useEffect(() => {
        setPage(1);
        setPriceMin(null);
        setPriceMax(null);
    }, [query]);

    const handleFilter = (min, max) => {
        setPriceMin(min);
        setPriceMax(max);
        setPage(1);
    };

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (priceMin === null && priceMax === null) return products;
        return products.filter((p) => {
            const price = extractPrice(p);
            if (price === null) return true;
            if (priceMin !== null && price < priceMin) return false;
            if (priceMax !== null && price > priceMax) return false;
            return true;
        });
    }, [products, priceMin, priceMax]);

    return (
        <div className="animate-fade-in bg-slate-50 dark:bg-dark-950 min-h-screen">
            <section className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-medium text-brand-600 mb-2 tracking-widest uppercase">Search Results</p>
                    <h1 className="text-3xl md:text-4xl font-serif text-dark-900 dark:text-slate-100">
                        {query ? `Showing results for "${query}"` : 'All Products'}
                    </h1>
                    {products && !isLoading && !error && (
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
                            {(priceMin !== null || priceMax !== null) && ` (filtered from ${products.length})`}
                        </p>
                    )}
                </div>
            </section>

            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Price Filter */}
                {!isLoading && !error && products && products.length > 0 && (
                    <div className="mb-8">
                        <PriceRangeFilter
                            onFilter={handleFilter}
                            totalCount={products.length}
                            filteredCount={filteredProducts.length}
                        />
                    </div>
                )}

                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                        <p>Failed to load search results. Please try again later.</p>
                    </div>
                )}

                {!isLoading && !error && filteredProducts.length === 0 && (
                    <div className="text-center py-24 bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-800">
                        <h3 className="text-xl font-serif text-dark-800 dark:text-slate-200 mb-2">No matching products</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-md">
                            {priceMin !== null || priceMax !== null
                                ? 'No products match your price range. Try adjusting the filter.'
                                : 'Try searching for something else like "laptop", "decor", etc.'}
                        </p>
                    </div>
                )}

                {filteredProducts.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        <Pagination 
                            pagination={pagination} 
                            currentPage={page} 
                            onPageChange={setPage} 
                            limit={limit} 
                        />
                    </>
                )}
            </section>
        </div>
    );
};

export default SearchPage;
