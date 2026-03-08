import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateAffiliateLink, appendTagToUrl } from '../utils/affiliateEngine';
import { useProduct, useProducts } from '../hooks/useProducts';
import { FiArrowRight, FiArrowLeft, FiShare2, FiCheck, FiMessageCircle, FiCopy } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const getPriceDisplay = (price, currency) => {
    if (price?.displayPrice) return price.displayPrice;
    if (typeof price === 'number' && currency) return `${currency} ${price.toLocaleString()}`;
    return 'Check Price';
};

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: product, isLoading, error } = useProduct(id);
    const { data: allRelatedProducts } = useProducts({
        category: product?.category
    });

    const [copied, setCopied] = useState(false);

    const relatedProducts = useMemo(() => {
        if (!allRelatedProducts || !product) return [];
        return allRelatedProducts
            .filter(p => p._id !== product._id)
            .slice(0, 4);
    }, [allRelatedProducts, product]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-dark-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-dark-900">
                <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl px-12">
                    <p>Product not found or an error occurred.</p>
                    <Link to="/" className="text-brand-600 underline mt-4 inline-block">Return Home</Link>
                </div>
            </div>
        );
    }

    const fallbackImage = 'https://placehold.co/600x600?text=No+Image';
    const mainImage = product.images?.[0] || product.imageURL || fallbackImage;
    const affiliateLink = product.amazonLink
        ? appendTagToUrl(product.amazonLink)
        : generateAffiliateLink(product.asin);
    const priceDisplay = getPriceDisplay(product.price, product.currency);
    const onSale = product.isOnSale && typeof product.salePrice === 'number';
    const saleDisplay = onSale ? getPriceDisplay(product.salePrice, product.currency) : null;
    const categoryName = product.category || null;
    const cleanDescription = (product.description || '').replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = fallbackImage;
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const el = document.createElement('textarea');
            el.value = window.location.href;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Check out ${product.title} 👉 ${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="animate-fade-in bg-slate-50 dark:bg-dark-900 min-h-screen pb-20">
            {/* Dynamic SEO Meta Tags */}
            <Helmet>
                <title>{product.title} - Sela Store</title>
                <meta name="description" content={cleanDescription} />
                <meta property="og:title" content={product.title} />
                <meta property="og:description" content={cleanDescription} />
                <meta property="og:image" content={mainImage} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 mb-8 transition-colors"
                >
                    <FiArrowLeft className="mr-2" aria-hidden /> Back
                </button>

                <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-800 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-16">

                        {/* Image Gallery */}
                        <div className="bg-slate-50 dark:bg-dark-800/50 p-6 md:p-16 flex items-center justify-center min-h-[300px] md:min-h-[400px] w-full md:w-1/2 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                            <img
                                src={mainImage}
                                alt={product.title}
                                onError={handleImageError}
                                className="w-full h-auto max-w-sm md:max-w-md object-contain mix-blend-multiply dark:mix-blend-normal brightness-100 dark:brightness-110 contrast-100 dark:contrast-110 drop-shadow-lg animate-float"
                            />
                        </div>

                        {/* Product Details */}
                        <div className="p-6 md:p-12 md:pl-0 flex flex-col justify-center w-full md:w-1/2">
                            {categoryName && (
                                <div className="mb-4">
                                    <span className="text-brand-600 text-xs md:text-sm font-medium tracking-widest uppercase bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full inline-block">
                                        {categoryName}
                                    </span>
                                </div>
                            )}

                            <h1 className="text-2xl md:text-4xl font-serif text-dark-900 dark:text-slate-100 mb-4 md:mb-6 leading-tight">
                                {product.title}
                            </h1>

                            <div className="mb-6 md:mb-8 tracking-tight">
                                {onSale && saleDisplay ? (
                                    <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                                        <span className="text-xl md:text-2xl font-light text-slate-400 line-through">
                                            {priceDisplay}
                                        </span>
                                        <span className="text-2xl md:text-3xl font-semibold text-rose-700">
                                            {saleDisplay}
                                        </span>
                                        {typeof product.salePercentage === 'number' && product.salePercentage > 0 && (
                                            <span className="inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-900/30 px-2 py-1 md:px-3 text-xs font-semibold text-rose-700">
                                                -{product.salePercentage}%
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-2xl md:text-3xl font-light text-dark-900 dark:text-slate-100">
                                        {priceDisplay}
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-stone dark:prose-invert mb-8 md:mb-10 text-sm md:text-base text-slate-600 dark:text-slate-300">
                                <p>{product.description}</p>
                            </div>

                            <div className="mt-auto flex flex-col gap-3 w-full">
                                {/* Buy Button */}
                                <a
                                    href={affiliateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-brand-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-medium hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 flex items-center justify-center space-x-2 text-base md:text-lg"
                                >
                                    <span>Buy on Amazon</span> <FiArrowRight className="ml-2" />
                                </a>

                                {/* Share Row */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 transition-all text-sm font-medium"
                                    >
                                        {copied ? <FiCheck size={15} className="text-green-500" /> : <FiCopy size={15} />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button
                                        onClick={handleWhatsApp}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-300 hover:border-green-400 hover:text-green-600 dark:hover:border-green-500 transition-all text-sm font-medium"
                                    >
                                        <FiMessageCircle size={15} />
                                        Share on WhatsApp
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 text-xs text-slate-400 flex items-center justify-center md:justify-start">
                                <span className="bg-slate-100 dark:bg-dark-800 p-1 rounded mr-2">🔒</span>
                                Securely processed through Amazon
                            </div>
                        </div>

                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-serif text-dark-900 dark:text-slate-100">Related Products</h2>
                            <Link
                                to={`/category/${product.category}`}
                                className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                            >
                                View All <FiArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
