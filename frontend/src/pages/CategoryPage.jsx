import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import { toSlug } from '../utils/categorySlug';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import PriceRangeFilter from '../components/PriceRangeFilter';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';

// Extract numeric price from product for filtering
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

const CategoryPage = () => {
    const { slug } = useParams();
    const { data: categories = [] } = useCategories();
    const currentCategory = categories.find((c) => toSlug(c) === slug);

    const [page, setPage] = useState(1);
    const limit = 12;

    const { data: productsData, isLoading, error } = useProducts({ category: slug, page, limit });
    const products = productsData?.products || [];
    const pagination = productsData?.pagination || null;

    const [priceMin, setPriceMin] = useState(null);
    const [priceMax, setPriceMax] = useState(null);

    // Reset pagination and filters on category change
    useEffect(() => {
        setPage(1);
        setPriceMin(null);
        setPriceMax(null);
    }, [slug]);

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
            {/* Category Header */}
            <section className="bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-dark-900 dark:text-slate-100 mb-4 capitalize">
                        {currentCategory || slug.replace(/-/g, ' ')}
                    </h1>
                </div>
            </section>

            {/* Product Grid */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: currentCategory || slug.replace(/-/g, ' '), path: `/category/${slug}` }]} />

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                        <p>Failed to load products for this category. Please try again later.</p>
                    </div>
                )}

                {!isLoading && !error && filteredProducts.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-800">
                        <div className="text-slate-300 dark:text-dark-700 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif text-dark-800 dark:text-slate-200 mb-2">No items found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-md">
                            {priceMin !== null || priceMax !== null
                                ? 'No products match your price range. Try adjusting the filter.'
                                : "We're currently curating more items for this category."}
                        </p>
                    </div>
                )}

                {filteredProducts.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
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

export default CategoryPage;
