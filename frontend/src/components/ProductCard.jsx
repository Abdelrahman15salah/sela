import { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateAffiliateLink, appendTagToUrl } from '../utils/affiliateEngine';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart, FiEye } from 'react-icons/fi';
import QuickViewModal from './QuickViewModal';

const FALLBACK_IMAGE = 'https://placehold.co/400x400?text=No+Image';

const getPriceDisplay = (price, currency) => {
    const hasCurrency = (text) => /[$£€]|EGP|USD|AED|SAR/i.test(text || '');

    if (price?.displayPrice && hasCurrency(price.displayPrice)) {
        // Ensure space between currency symbol and amount
        return price.displayPrice.replace(/([$£€]|EGP|USD|AED|SAR)(\d)/i, '$1 $2');
    }

    if (typeof price === 'object' && price !== null) {
        if (typeof price.amount === 'number') {
            return `${price.currency || currency || 'EGP'} ${price.amount.toLocaleString()}`;
        }
        return 'Check Price';
    }

    if (typeof price === 'number') {
        return `${currency || 'EGP'} ${price.toLocaleString()}`;
    }

    return 'Check Price';
};

const ProductCard = ({ product }) => {
    const {
        _id, asin, title, price, currency, domain, images, imageURL,
        amazonLink, rating, isFeatured, salePrice, salePercentage, isOnSale,
    } = product;

    const mainImage = images?.[0] || imageURL || FALLBACK_IMAGE;
    const priceDisplay = getPriceDisplay(price, currency);
    const onSale = isOnSale && typeof salePrice === 'number';
    const saleDisplay = onSale ? getPriceDisplay(salePrice, currency) : null;
    const affiliateLink = amazonLink ? appendTagToUrl(amazonLink) : generateAffiliateLink(asin, domain);
    const productUrl = `/product/${_id || asin}`;

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = FALLBACK_IMAGE;
    };

    const { toggleWishlist, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(_id || asin);
    const [showQuickView, setShowQuickView] = useState(false);

    return (
        <>
            <motion.article
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group relative bg-white dark:bg-dark-900 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col h-full border border-slate-100 dark:border-dark-800 hover:border-transparent cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] hover:-translate-y-2"
            >
                <Link to={productUrl} className="absolute inset-0 z-0" aria-hidden="true" />

                {/* Top Image Area */}
                <div className="relative z-10 aspect-[4/5] overflow-hidden bg-slate-50/50 dark:bg-dark-800/50 flex items-center justify-center p-8 pointer-events-none">

                    {/* Badges & Actions */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                            {isFeatured && (
                                <span className="bg-dark-900/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm shadow-dark-900/10">
                                    Featured
                                </span>
                            )}
                            {onSale && (
                                <span className="bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm shadow-rose-500/20">
                                    {typeof salePercentage === 'number' && salePercentage > 0
                                        ? `Save ${salePercentage}%`
                                        : 'Sale'}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleWishlist(product);
                                }}
                                className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-sm ${isFavorite
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-white/80 dark:bg-dark-900/80 text-slate-400 hover:text-brand-600'
                                    }`}
                                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <FiHeart size={18} className={isFavorite ? "fill-white" : ""} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowQuickView(true);
                                }}
                                className="p-2.5 rounded-full bg-white/80 dark:bg-dark-900/80 text-slate-400 hover:text-brand-600 backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-sm"
                                aria-label="Quick view"
                            >
                                <FiEye size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Primary Image */}
                    <img
                        src={mainImage}
                        alt={title}
                        onError={handleImageError}
                        className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal brightness-100 dark:brightness-110 contrast-100 dark:contrast-110 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Glassmorphism Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-dark-900/10 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 opacity-0 group-hover:opacity-100 pointer-events-auto">
                        <a
                            href={affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-600 text-white font-medium px-8 py-3.5 rounded-full shadow-lg transform translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-brand-500 w-56 text-center focus:outline-none focus:ring-4 focus:ring-brand-500/30"
                            style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Buy on Amazon
                        </a>

                        <Link
                            to={productUrl}
                            className="bg-white/80 backdrop-blur-md text-dark-900 font-medium px-8 py-3.5 rounded-full shadow-lg transform translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 hover:bg-white w-56 text-center focus:outline-none focus:ring-4 focus:ring-dark-900/10"
                            style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
                        >
                            View Details
                        </Link>
                    </div>
                </div>

                {/* Bottom Content Area */}
                <div className="p-6 flex flex-col flex-grow z-10 pointer-events-none bg-white dark:bg-dark-900">

                    {/* Rating (Compact) */}
                    {rating > 0 && (
                        <div className="flex items-center gap-1 mb-2" role="img" aria-label={`Rating: ${rating} out of 5`}>
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-brand-500' : 'text-slate-200 dark:text-dark-600'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    )}

                    <Link to={productUrl} className="pointer-events-auto hover:text-brand-600 transition-colors">
                        <h3 className="font-serif text-xl font-medium text-dark-800 dark:text-slate-100 leading-snug line-clamp-3 mb-4 group-hover:text-brand-600 transition-colors title-text">
                            {title}
                        </h3>
                    </Link>

                    {/* Price and Minimal Action */}
                    <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50 dark:border-dark-700 pointer-events-auto">
                        <div className="flex flex-col pointer-events-none">
                            {onSale && saleDisplay ? (
                                <>
                                    <span className="text-xs text-slate-400 line-through mb-0.5">
                                        {priceDisplay}
                                    </span>
                                    <span className="text-xl font-medium tracking-tight text-rose-600">
                                        {saleDisplay}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-medium tracking-tight text-dark-900 dark:text-slate-100">
                                    {priceDisplay}
                                </span>
                            )}
                        </div>

                        <a
                            href={affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-400 hover:bg-brand-600 hover:text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            View Offer
                        </a>
                    </div>
                </div>
            </motion.article>

            <QuickViewModal
                product={product}
                isOpen={showQuickView}
                onClose={() => setShowQuickView(false)}
            />
        </>
    );
};

export default ProductCard;
