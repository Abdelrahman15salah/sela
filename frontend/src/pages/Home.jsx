import { useProducts, useCategories } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import CategorySection from '../components/CategorySection';
import { FiArrowRight, FiShield, FiClock, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { toSlug } from '../utils/categorySlug';

const CATEGORY_EMOJI = {
    'electronics': '⚡',
    "men's clothing": '👔',
    "women's clothing": '👗',
    'jewelery': '💎',
};
const getCategoryEmoji = (name) => {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
        if (key.includes(k)) return v;
    }
    return '🛍️';
};

const VALUE_PROPS = [
    {
        icon: FiShield,
        title: 'Authentic Quality',
        desc: 'Every product is carefully vetted for authenticity and quality before being listed in our store.',
    },
    {
        icon: FiClock,
        title: 'Fast Delivery',
        desc: 'Orders dispatched within 48 hours. Track your package in real time from checkout to door.',
    },
    {
        icon: FiStar,
        title: 'Expert Curation',
        desc: 'Our team handpicks each item — no filler, no noise. Just things genuinely worth owning.',
    },
];

const MARQUEE_ITEMS = [
    'Electronics', 'Jewelery', "Men's Clothing", "Women's Clothing",
    'Free shipping over $50', 'New arrivals weekly',
];

const SectionHeader = ({ eyebrow, title, linkTo, linkLabel = 'View all' }) => (
    <div className="flex items-end justify-between mb-12">
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-500 mb-2">{eyebrow}</p>
            <h2 className="font-serif text-3xl md:text-4xl text-dark-900 dark:text-slate-100 font-normal">{title}</h2>
        </div>
        {linkTo && (
            <Link
                to={linkTo}
                className="hidden md:inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-slate-400 hover:text-dark-900 dark:hover:text-white border-b border-slate-200 dark:border-dark-700 hover:border-dark-900 dark:hover:border-white pb-0.5 transition-all"
            >
                {linkLabel} <FiArrowRight size={11} />
            </Link>
        )}
    </div>
);

const Home = () => {
    const { data: productsData, isLoading, error } = useProducts({ isFeatured: 'true' });
    const { data: categories = [] } = useCategories();
    const products = productsData?.products || [];

    const prioritizedCategories = ['Mobiles', 'Tech', 'Home', 'Style'];
    const homeCategories = categories
        ? [...new Set([
            ...prioritizedCategories.filter(c => categories.includes(c)),
            ...categories
        ])].slice(0, 4)
        : [];

    const propsRef = useRef(null);
    const propsInView = useInView(propsRef, { once: true, margin: '-80px' });

    return (
        <div className="animate-fade-in">

            {/* ── HERO ───────────────────────────────── */}
            <section className="relative min-h-[88vh] bg-dark-950 flex items-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=60&w=1600')] bg-cover bg-center opacity-10" />
                {/* Noise grain */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22/%3E%3C/svg%3E')]" />
                {/* Purple glow */}
                <div className="absolute -top-32 -right-20 w-[520px] h-[520px] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 left-[5%] w-96 h-96 rounded-full bg-brand-700/10 blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left — copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.div
                            className="flex items-center gap-3 mb-7"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <span className="w-8 h-px bg-brand-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">The Art of Curation</span>
                        </motion.div>

                        <h1 className="font-serif text-[clamp(44px,6vw,72px)] leading-[1.07] text-white mb-6 font-normal tracking-tight">
                            Elevate Your<br />
                            <em className="italic font-light text-brand-300/90">Everyday</em><br />
                            Living
                        </h1>

                        <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md mb-10 font-light">
                            Discover premium tech, home essentials, and lifestyle accessories — each piece curated for quality and design.
                        </p>

                        <div className="flex items-center gap-4 flex-wrap">
                            <Link
                                to="/search"
                                className="group inline-flex items-center gap-3 bg-brand-600 hover:bg-brand-500 text-white px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/30"
                            >
                                Shop Collection
                                <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                                    <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </Link>
                            <Link
                                to="/wishlist"
                                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                View wishlist <span className="opacity-40">→</span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right — stats + badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col gap-3"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { num: '200+', label: 'Curated products' },
                                { num: '4.9★', label: 'Average rating' },
                                { num: '48h', label: 'Fast delivery' },
                                { num: '100%', label: 'Authentic items' },
                            ].map((s, i) => (
                                <motion.div
                                    key={s.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 + i * 0.07, duration: 0.6 }}
                                    className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
                                >
                                    <p className="font-serif text-3xl text-white font-normal leading-none">{s.num}</p>
                                    <p className="text-[11px] text-slate-500 mt-1.5 tracking-wide">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="bg-brand-600/10 border border-brand-500/20 rounded-2xl px-5 py-4 flex items-center gap-3"
                        >
                            <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                            <p className="text-xs text-brand-300/80 leading-relaxed">
                                New arrivals added weekly — premium quality, handpicked for you
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── MARQUEE ────────────────────────────── */}
            <div className="bg-white dark:bg-dark-900 border-y border-slate-100 dark:border-dark-800 py-3.5 overflow-hidden">
                <div className="flex whitespace-nowrap animate-[marquee_24s_linear_infinite]">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-3.5 px-8">
                            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{item}</span>
                            <span className="w-1 h-1 rounded-full bg-brand-200 dark:bg-brand-800 shrink-0" />
                        </span>
                    ))}
                </div>
            </div>

            {/* ── FEATURED PRODUCTS ──────────────────── */}
            <section className="py-20 bg-slate-50 dark:bg-dark-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <SectionHeader eyebrow="Handpicked" title="Curated Selection" linkTo="/search" linkLabel="View all products" />
                    </motion.div>

                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl">
                            Failed to load products. Please try again later.
                        </div>
                    )}

                    {!isLoading && !error && products.length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                            <p className="text-slate-400 text-base">No products found yet. Check back soon!</p>
                        </div>
                    )}

                    {products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product, i) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── VALUE PROPS ────────────────────────── */}
            <section ref={propsRef} className="bg-white dark:bg-dark-950 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dark-800">
                        {VALUE_PROPS.map(({ icon: Icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={propsInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: i * 0.12, duration: 0.6 }}
                                className="px-10 py-12 first:pl-0 last:pr-0"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-600/15 flex items-center justify-center mb-5">
                                    <Icon size={17} className="text-brand-300" />
                                </div>
                                <h3 className="font-serif text-xl text-black  font-normal mb-3">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-light">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES GRID ────────────────────── */}
            {categories.length > 0 && (
                <section className="py-20 bg-slate-50 dark:bg-dark-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.6 }}
                        >
                            <SectionHeader eyebrow="Shop by" title="Collections" linkTo="/search" linkLabel="All categories" />
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.slice(0, 4).map((name, i) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: i * 0.08, duration: 0.5 }}
                                >
                                    <Link
                                        to={`/category/${toSlug(name)}`}
                                        className={`group flex flex-col justify-between p-7 rounded-2xl border min-h-[160px] transition-all hover:-translate-y-1
                                            ${i === 0
                                                ? 'bg-dark-900 border-dark-800 hover:border-dark-700'
                                                : 'bg-white dark:bg-dark-900 border-slate-100 dark:border-dark-800 hover:border-slate-200 dark:hover:border-dark-700'
                                            }`}
                                    >
                                        <span className="text-3xl">{getCategoryEmoji(name)}</span>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className={`font-serif text-xl font-normal ${i === 0 ? 'text-white' : 'text-dark-900 dark:text-white'}`}>{name}</p>
                                            </div>
                                            <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-all
                                                group-hover:bg-dark-900 group-hover:border-dark-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-dark-900
                                                ${i === 0
                                                    ? 'border-dark-700 text-slate-400'
                                                    : 'border-slate-200 dark:border-dark-700 text-slate-400'
                                                }`}>
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── PER-CATEGORY SECTIONS ──────────────── */}
            {!isLoading && homeCategories.map((cat, index) => (
                <CategorySection key={cat} category={cat} index={index} />
            ))}
        </div>
    );
};

export default Home;