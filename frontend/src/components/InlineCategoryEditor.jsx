import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { FiChevronDown, FiCheck, FiX, FiTag } from 'react-icons/fi';

/**
 * InlineCategoryEditor
 * Drop this inside the product list <li> in AdminPage.
 *
 * Props:
 *   product        – the full product object
 *   categoryOptions – the merged array of category strings already used in AdminPage
 */
const InlineCategoryEditor = ({ product, categoryOptions }) => {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [customVal, setCustomVal] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [saved, setSaved] = useState(false);
    const wrapperRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setShowCustom(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const mutation = useMutation({
        mutationFn: (category) =>
            api.put(`/products/${product._id}`, {
                ...product,
                price: product.price?.amount ?? product.price ?? 0,
                currency: product.price?.currency ?? product.currency ?? 'EGP',
                imageURL: product.imageURL || product.images?.[0] || '',
                category,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setOpen(false);
            setShowCustom(false);
            setCustomVal('');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        },
    });

    const apply = (cat) => {
        if (!cat || cat === product.category) { setOpen(false); return; }
        mutation.mutate(cat);
    };

    const applyCustom = () => {
        const v = customVal.trim();
        if (v) apply(v);
    };

    const currentCat = product.category || 'Uncategorized';

    return (
        <div ref={wrapperRef} className="relative inline-flex items-center">
            {/* Trigger badge */}
            <button
                onClick={() => { setOpen((o) => !o); setShowCustom(false); }}
                title="Quick-change category"
                className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    transition-all duration-150 select-none
                    ${saved
                        ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 hover:ring-1 hover:ring-brand-300'
                    }
                `}
            >
                {saved ? <FiCheck size={11} /> : <FiTag size={11} />}
                <span className="max-w-[100px] truncate">{saved ? 'Saved!' : currentCat}</span>
                {!saved && (
                    <FiChevronDown
                        size={11}
                        className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full mt-1.5 z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Category</span>
                        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <FiX size={13} />
                        </button>
                    </div>

                    {/* Category list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {categoryOptions.filter(c => c !== '_other_').map((cat) => (
                            <li key={cat}>
                                <button
                                    onClick={() => apply(cat)}
                                    disabled={mutation.isPending}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-2 text-sm
                                        transition-colors text-left
                                        ${cat === currentCat
                                            ? 'bg-brand-50 text-brand-700 font-semibold'
                                            : 'text-slate-700 hover:bg-slate-50'
                                        }
                                        disabled:opacity-50
                                    `}
                                >
                                    {cat}
                                    {cat === currentCat && <FiCheck size={13} className="text-brand-600" />}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Custom input */}
                    <div className="border-t border-slate-100 p-2">
                        {!showCustom ? (
                            <button
                                onClick={() => setShowCustom(true)}
                                className="w-full text-xs text-slate-500 hover:text-brand-600 py-1.5 rounded-lg hover:bg-brand-50 transition-colors font-medium"
                            >
                                + Add custom category
                            </button>
                        ) : (
                            <div className="flex gap-1.5">
                                <input
                                    autoFocus
                                    type="text"
                                    value={customVal}
                                    onChange={(e) => setCustomVal(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') applyCustom(); if (e.key === 'Escape') setShowCustom(false); }}
                                    placeholder="Category name…"
                                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none"
                                />
                                <button
                                    onClick={applyCustom}
                                    disabled={!customVal.trim() || mutation.isPending}
                                    className="px-2.5 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 disabled:opacity-50 transition-colors"
                                >
                                    <FiCheck size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {mutation.isPending && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InlineCategoryEditor;
