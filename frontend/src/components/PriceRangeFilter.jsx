import { useState } from 'react';
import { FiSliders, FiX } from 'react-icons/fi';

const PriceRangeFilter = ({ onFilter, totalCount, filteredCount }) => {
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [isApplied, setIsApplied] = useState(false);

    const handleApply = () => {
        const minVal = min !== '' ? parseFloat(min) : null;
        const maxVal = max !== '' ? parseFloat(max) : null;
        onFilter(minVal, maxVal);
        setIsApplied(true);
    };

    const handleClear = () => {
        setMin('');
        setMax('');
        onFilter(null, null);
        setIsApplied(false);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl px-5 py-3 shadow-sm">
            <FiSliders className="text-brand-500 shrink-0" size={16} />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">Price:</span>

            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <span className="text-slate-400 text-sm">–</span>
                <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    className="w-24 px-3 py-1.5 text-sm border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
            </div>

            <button
                onClick={handleApply}
                disabled={min === '' && max === ''}
                className="px-4 py-1.5 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Apply
            </button>

            {isApplied && (
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors"
                >
                    <FiX size={14} /> Clear
                </button>
            )}

            {isApplied && (
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                    {filteredCount} of {totalCount} items
                </span>
            )}
        </div>
    );
};

export default PriceRangeFilter;
