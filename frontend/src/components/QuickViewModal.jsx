import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiShoppingCart, FiStar } from 'react-icons/fi';
import { generateAffiliateLink, appendTagToUrl } from '../utils/affiliateEngine';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    if (!product) return null;

    const {
        asin, title, price, currency, domain, images, imageURL,
        amazonLink, rating, salePrice, isOnSale, description
    } = product;

    const FALLBACK_IMAGE = 'https://placehold.co/400x400?text=No+Image';
    const mainImage = images?.[0] || imageURL || FALLBACK_IMAGE;

    const getPriceDisplay = (p, c) => {
        const hasCurrency = (text) => /[$£€]|EGP|USD|AED|SAR/i.test(text || '');

        if (p?.displayPrice && hasCurrency(p.displayPrice)) {
            // Ensure space between currency symbol and amount
            return p.displayPrice.replace(/([$£€]|EGP|USD|AED|SAR)(\d)/i, '$1 $2');
        }

        if (typeof p === 'object' && p !== null) {
            if (typeof p.amount === 'number') {
                return `${p.currency || c || 'EGP'} ${p.amount.toLocaleString()}`;
            }
            return 'Check Price';
        }

        if (typeof p === 'number') {
            return `${c || 'EGP'} ${p.toLocaleString()}`;
        }

        return 'Check Price';
    };

    const priceDisplay = getPriceDisplay(price, currency);
    const onSale = isOnSale && typeof salePrice === 'number';
    const saleDisplay = onSale ? getPriceDisplay(salePrice, currency) : null;
    const affiliateLink = amazonLink ? appendTagToUrl(amazonLink) : generateAffiliateLink(asin, domain);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-dark-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                        >
                            <FiX size={20} />
                        </button>

                        {/* Left Side: Image */}
                        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-dark-800/50 p-8 flex items-center justify-center min-h-[300px]">
                            <img
                                src={mainImage}
                                alt={title}
                                className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal brightness-100 dark:brightness-110 contrast-100 dark:contrast-110 drop-shadow-md"
                            />
                        </div>

                        {/* Right Side: Details */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                            {rating > 0 && (
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            size={14}
                                            className={`${i < Math.floor(rating) ? 'text-brand-500 fill-brand-500' : 'text-slate-200 dark:text-dark-700'}`}
                                        />
                                    ))}
                                    <span className="text-xs text-slate-400 ml-1 font-medium">{rating} / 5</span>
                                </div>
                            )}

                            <h2 className="text-2xl md:text-3xl font-serif text-dark-900 dark:text-slate-100 mb-4 leading-tight">
                                {title}
                            </h2>

                            <div className="mb-6">
                                {onSale && saleDisplay ? (
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-lg text-slate-400 line-through">
                                            {priceDisplay}
                                        </span>
                                        <span className="text-2xl font-semibold text-rose-600">
                                            {saleDisplay}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-light text-dark-900 dark:text-slate-100">
                                        {priceDisplay}
                                    </span>
                                )}
                            </div>

                            <div className="text-slate-600 dark:text-slate-300 text-sm mb-8 line-clamp-4 overflow-hidden">
                                {description || "No description available for this curated selection."}
                            </div>

                            <div className="mt-auto flex flex-col gap-3">
                                <a
                                    href={affiliateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-600/20"
                                >
                                    <span>Buy on Amazon</span>
                                    <FiArrowRight />
                                </a>
                                <button
                                    onClick={onClose}
                                    className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-brand-600 transition-colors py-2"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuickViewModal;
