import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import PriceRangeFilter from '../components/PriceRangeFilter';
import Pagination from '../components/Pagination';
import { FiSearch } from 'react-icons/fi';

const SEARCH_DEBOUNCE_MS = 380;

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
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(urlQuery);
    const debouncedQuery = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);

    const { data: productsData, isLoading, error } = useProducts({
        search: debouncedQuery,
        page,
        limit,
        sortBy: debouncedQuery ? 'relevance' : 'createdAt',
    });
    const products = productsData?.products || [];
    const pagination = productsData?.pagination || null;

    const [priceMin, setPriceMin] = useState(null);
    const [priceMax, setPriceMax] = useState(null);

    const updateUrl = useCallback((q) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (q.trim()) next.set('q', q.trim());
            else next.delete('q');
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    useEffect(() => {
        updateUrl(debouncedQuery);
    }, [debouncedQuery, updateUrl]);

    useEffect(() => {
        setInputValue(urlQuery);
    }, [urlQuery]);

    useEffect(() => {
        setPage(1);
        setPriceMin(null);
        setPriceMax(null);
    }, [debouncedQuery]);

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
                    <p className="text-sm font-medium text-brand-600 mb-2 tracking-widest uppercase">Search</p>
                    <h1 className="text-3xl md:text-4xl font-serif text-dark-900 dark:text-slate-100 mb-6">
                        {debouncedQuery ? `Results for "${debouncedQuery}"` : 'All Products'}
                    </h1>
                    <div className="max-w-2xl">
                        <label htmlFor="search-page-input" className="sr-only">Search products</label>
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} aria-hidden />
                            <input
                                id="search-page-input"
                                type="search"
                                autoComplete="off"
                                placeholder="Search by name, category, or ASIN..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => { setInputValue(''); setPage(1); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Results update as you type. Best matches appear first.
                        </p>
                    </div>
                    {products && !isLoading && !error && (
                        <p className="text-slate-500 dark:text-slate-400 mt-6">
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
                                : debouncedQuery
                                    ? `No results for "${debouncedQuery}". Try different words or browse all products above.`
                                    : 'Use the search box above or browse by category from the menu.'}
                        </p>
                    </div>
                )}

                {filteredProducts.length > 0 && (
                    <>
                        <Pagination 
                            pagination={pagination} 
                            currentPage={page} 
                            onPageChange={setPage} 
                            limit={limit} 
                            onLimitChange={setLimit}
                            isTop={true} 
                        />

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
                            onLimitChange={setLimit}
                        />
                    </>
                )}
            </section>
        </div>
    );
};

export default SearchPage;
