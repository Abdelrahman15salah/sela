import React from 'react';

const Pagination = ({ pagination, currentPage, onPageChange, limit = 12 }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center md:text-left">
                Showing <span className="text-dark-900 dark:text-slate-100">{(currentPage - 1) * limit + 1}</span> to <span className="text-dark-900 dark:text-slate-100">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="text-dark-900 dark:text-slate-100">{pagination.total}</span> products
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
                <button
                    disabled={currentPage === 1}
                    onClick={() => {
                        onPageChange(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-dark-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                    Previous
                </button>
                <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 3), Math.min(pagination.totalPages, currentPage + 2))
                        .map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => {
                                    onPageChange(pageNum);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                                    currentPage === pageNum
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-dark-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
