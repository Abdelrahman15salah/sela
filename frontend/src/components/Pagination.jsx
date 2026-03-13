import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ pagination, currentPage, onPageChange, limit, onLimitChange, limitOptions = [12, 24, 48, 96], isTop = false }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 w-full ${isTop ? 'mb-8 pb-4 border-b' : 'mt-8 pt-8 border-t'} border-slate-200 dark:border-dark-800`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium w-full md:w-auto justify-between md:justify-start">
                <p className="text-center sm:text-left">
                    Showing <span className="text-dark-900 dark:text-slate-100">{(currentPage - 1) * limit + 1}</span> to <span className="text-dark-900 dark:text-slate-100">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="text-dark-900 dark:text-slate-100">{pagination.total}</span> products
                </p>
                {onLimitChange && (
                    <div className="flex items-center gap-2">
                        <label htmlFor={`limit-select-${isTop ? 'top' : 'bottom'}`} className="sr-only">Items per page:</label>
                        <select 
                            id={`limit-select-${isTop ? 'top' : 'bottom'}`}
                            value={limit} 
                            onChange={(e) => {
                                onLimitChange(Number(e.target.value));
                                onPageChange(1);
                            }}
                            className="bg-slate-50 dark:bg-dark-800 border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 outline-none text-dark-900 dark:text-slate-100 transition-colors font-semibold cursor-pointer"
                        >
                            {limitOptions.map(opt => (
                                <option key={opt} value={opt}>{opt} per page</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
                <button
                    disabled={currentPage === 1}
                    onClick={() => {
                        onPageChange(currentPage - 1);
                        if (!isTop) window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-dark-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                    <FiChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Prev</span>
                </button>
                <div className="flex items-center gap-1 px-1 sm:px-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 3), Math.min(pagination.totalPages, currentPage + 2))
                        .map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => {
                                    onPageChange(pageNum);
                                    if (!isTop) window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                                    currentPage === pageNum
                                        ? 'bg-dark-900 text-white dark:bg-brand-600 shadow-lg shadow-brand-600/20'
                                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-800'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                </div>
                <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => {
                        onPageChange(currentPage + 1);
                        if (!isTop) window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-dark-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                    <span className="hidden sm:inline">Next</span> <FiChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
