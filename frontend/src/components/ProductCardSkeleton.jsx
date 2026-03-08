const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
        <div className="aspect-[4/5] bg-slate-200" />
        <div className="p-6 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-5 bg-slate-200 rounded w-1/2" />
            <div className="pt-4 border-t border-slate-100 flex justify-between">
                <div className="h-6 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-20" />
            </div>
        </div>
    </div>
);

export default ProductCardSkeleton;
