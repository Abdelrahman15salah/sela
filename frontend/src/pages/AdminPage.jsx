import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useProducts, useCategories } from '../hooks/useProducts';
import { FiPlus, FiCheck, FiPackage, FiEdit2, FiTrash2, FiX, FiList, FiTrendingUp, FiLogOut, FiDollarSign } from 'react-icons/fi';
import { ProductsOverTimeChart, CategoryDistributionChart } from '../components/AdminDashboardCharts';
import Pagination from '../components/Pagination';

const parseAsinFromUrl = (url) => {
    if (!url) return '';
    try {
        const patterns = [
            /\/dp\/([A-Z0-9]{10})/i,
            /\/gp\/product\/([A-Z0-9]{10})/i,
            /[?&]asin=([A-Z0-9]{10})/i,
            /\/ASIN\/([A-Z0-9]{10})/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return '';
    } catch {
        return '';
    }
};

const DEFAULT_CATEGORIES = ['Mobiles', 'Tech', 'Home', 'Style', 'Beauty', 'Sports', 'Books', 'Gaming'];

const initialForm = {
    asin: '',
    title: '',
    description: '',
    price: '',
    currency: 'EGP',
    imageURL: '',
    category: '',
    categoryOther: '',
    amazonLink: '',
    isFeatured: false,
    salePrice: '',
    isOnSale: false,
};
const getPriceDisplay = (price, currency) => {
    const hasCurrency = (text) => /[$£€]|EGP|USD|AED|SAR/i.test(text || '');

    if (price?.displayPrice && hasCurrency(price.displayPrice)) {
        // Ensure space between currency symbol and amount (e.g., EGP 100 instead of EGP100)
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

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'single', or 'bulk'
    const [form, setForm] = useState(initialForm);
    const [bulkInput, setBulkInput] = useState('');
    const [quickAddInput, setQuickAddInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    // Pagination & Filter state for the product list
    const [listPage, setListPage] = useState(1);
    const [listSearch, setListSearch] = useState('');
    const [listCategory, setListCategory] = useState('');
    const [listLimit] = useState(10);

    // Setup Auth Check
    const authCredentials = localStorage.getItem('adminAuth');

    useEffect(() => {
        if (!authCredentials) {
            navigate('/admin/login');
        }
    }, [authCredentials, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

    const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const res = await api.get('/admin/dashboard');
            return res.data;
        },
        enabled: !!authCredentials && activeTab === 'dashboard',
    });

    const { data: productsData = { products: [], pagination: {} }, isLoading: isProductsLoading } = useProducts({
        search: listSearch,
        category: listCategory,
        page: listPage,
        limit: listLimit
    });
    const products = productsData.products || [];
    const pagination = productsData.pagination || {};
    const { data: apiCategories = [] } = useCategories();
    const categoryOptions = [...new Set([...DEFAULT_CATEGORIES, ...apiCategories])].sort();

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/products', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCancelEdit();
            setSuccess('Product added successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err) => {
            setError(err.message || 'Failed to add product');
            setSuccess('');
        },
    });

    const quickSyncMutation = useMutation({
        mutationFn: (data) => api.post('/products/sync', data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setQuickAddInput('');

            if (res.data.needsReview) {
                setError('We added the product, but Amazon blocked us from grabbing the details. Please fill them in below!');
                handleEditClick(res.data.product);
            } else {
                setSuccess(`Success! Added "${res.data.product.title}" to ${res.data.product.category}`);
                setTimeout(() => setSuccess(''), 6000);
            }
        },
        onError: (err) => {
            setError(err.response?.data?.message || err.message || 'Failed to quick add product');
            setSuccess('');
        },
    });

    const bulkSyncMutation = useMutation({
        mutationFn: (data) => api.post('/products/bulk-sync', data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setBulkInput('');
            setSuccess(res.data?.message || 'Products bulk synced successfully!');
            setTimeout(() => setSuccess(''), 5000);
        },
        onError: (err) => {
            setError(err.message || 'Failed to bulk sync products');
            setSuccess('');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['product', editingId] });
            handleCancelEdit();
            setSuccess('Product updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err) => {
            setError(err.message || 'Failed to update product');
            setSuccess('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (err) => alert(err.message || 'Failed to delete product'),
    });

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setActiveTab('single');
        const cat = categoryOptions.includes(product.category) ? product.category : (product.category ? '_other_' : '');
        setForm({
            asin: product.asin || '',
            title: product.title || '',
            description: product.description || '',
            price: product.price?.amount ?? product.price ?? '',
            currency: product.price?.currency ?? product.currency ?? 'EGP',
            imageURL: product.imageURL || product.images?.[0] || '',
            category: cat,
            categoryOther: cat === '_other_' ? product.category : '',
            amazonLink: product.amazonLink || '',
            isFeatured: !!product.isFeatured,
            salePrice: product.salePrice ?? '',
            isOnSale: !!product.isOnSale,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(initialForm);
        setError('');
    };

    const handleDeleteClick = (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Auto-extract ASIN if a URL is pasted into EITHER field
        if ((name === 'amazonLink' || name === 'asin') && value && value.includes('amazon.')) {
            const extracted = parseAsinFromUrl(value);
            if (extracted) {
                setForm((prev) => ({ ...prev, asin: extracted }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const priceNum = parseFloat(form.price);
        const categoryValue = form.category === '_other_' ? form.categoryOther.trim() : form.category;
        const saleNum = parseFloat(form.salePrice);
        const payload = {
            asin: form.asin.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            price: isNaN(priceNum) ? 0 : priceNum,
            currency: form.currency || 'EGP',
            imageURL: form.imageURL.trim() || undefined,
            category: categoryValue || undefined,
            amazonLink: form.amazonLink.trim() || undefined,
            isFeatured: form.isFeatured,
            salePrice: isNaN(saleNum) ? undefined : saleNum,
            isOnSale: form.isOnSale,
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (!quickAddInput.trim()) return;
        setError('');
        quickSyncMutation.mutate({ input: quickAddInput.trim() });
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        setError('');
        const inputs = bulkInput.split('\n').map(line => line.trim()).filter(Boolean);
        if (inputs.length === 0) {
            setError('Please enter at least one Amazon link or ASIN');
            return;
        }
        bulkSyncMutation.mutate({ inputs });
    };

    if (!authCredentials) return null; // Prevent flicker while redirecting

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <Link to="/" className="text-sm text-slate-500 hover:text-brand-600">← Back to store</Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-serif text-dark-900 mt-2">
                                {editingId ? 'Edit Product' : 'Admin Panel'}
                            </h1>
                            <button onClick={handleLogout} className="mt-2 text-sm flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors">
                                <FiLogOut /> Logout
                            </button>
                        </div>
                        <p className="text-slate-500 mt-1">
                            {editingId ? 'Modify the details of your selected product.' : 'Manage your storefront inventory & monitor activity.'}
                        </p>
                    </div>
                    {!editingId && (
                        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => { setActiveTab('dashboard'); setError(''); setSuccess(''); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white text-dark-900 shadow-sm' : 'text-slate-500 hover:text-dark-900'}`}
                            >
                                <span className="flex items-center gap-2"><FiTrendingUp /> Dashboard</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('single'); setError(''); setSuccess(''); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'single' ? 'bg-white text-dark-900 shadow-sm' : 'text-slate-500 hover:text-dark-900'}`}
                            >
                                <span className="flex items-center gap-2"><FiPlus /> Single Item</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('bulk'); setError(''); setSuccess(''); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bulk' ? 'bg-white text-dark-900 shadow-sm' : 'text-slate-500 hover:text-dark-900'}`}
                            >
                                <span className="flex items-center gap-2"><FiList /> Bulk Import</span>
                            </button>
                        </div>
                    )}
                    {editingId && (
                        <button
                            onClick={handleCancelEdit}
                            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <FiX /> Cancel Edit
                        </button>
                    )}
                </div>

                {/* Quick Add Section for non-tech users */}
                {activeTab === 'dashboard' && !editingId && (
                    <div className="mb-8 bg-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <FiPlus size={120} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-2xl font-serif mb-2">Magic Quick Add</h2>
                            <p className="text-brand-100 mb-6">Just paste an Amazon link below to add a product instantly. We'll handle titles, prices, and images for you!</p>

                            <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="Paste Amazon product link here..."
                                    value={quickAddInput}
                                    onChange={(e) => setQuickAddInput(e.target.value)}
                                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-brand-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
                                />
                                <button
                                    type="submit"
                                    disabled={quickSyncMutation.isPending || !quickAddInput.trim()}
                                    className="bg-white text-brand-700 px-8 py-4 rounded-2xl font-bold hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {quickSyncMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
                                            Fetching...
                                        </span>
                                    ) : (
                                        <>Add Product</>
                                    )}
                                </button>
                            </form>

                            {success && activeTab === 'dashboard' && (
                                <div className="mt-4 p-4 bg-white/20 backdrop-blur-md rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
                                    <FiCheck className="text-white" /> {success}
                                </div>
                            )}
                            {error && activeTab === 'dashboard' && (
                                <div className="mt-4 p-4 bg-rose-500/20 backdrop-blur-md rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in border border-rose-500/30">
                                    <FiX className="text-white" /> {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'dashboard' && !editingId && (
                    <div className="space-y-6">
                        {isDashboardLoading ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <p className="text-slate-500 animate-pulse">Loading statistics...</p>
                            </div>
                        ) : dashboardData ? (
                            <>
                                {/* Top Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Visits</p>
                                        <p className="text-4xl font-serif text-dark-900">{dashboardData.stats?.totalVisitors || 0}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Products</p>
                                        <p className="text-4xl font-serif text-slate-700">{dashboardData.stats?.totalProducts || 0}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Active Categories</p>
                                        <p className="text-4xl font-serif text-brand-600">{dashboardData.stats?.totalCategories || 0}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Products on Sale</p>
                                        <p className="text-4xl font-serif text-rose-500">{dashboardData.stats?.saleProductsCount || 0}</p>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Products Over Time Chart */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                                        <h3 className="text-lg font-medium text-dark-900 mb-6 font-serif">Product Growth (30 Days)</h3>
                                        <div className="flex-1 min-h-[300px]">
                                            <ProductsOverTimeChart data={dashboardData.analytics?.productsOverTime} />
                                        </div>
                                    </div>

                                    {/* Category Distribution Chart */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                                        <h3 className="text-lg font-medium text-dark-900 mb-6 font-serif">Category Distribution</h3>
                                        <div className="flex-1 min-h-[300px]">
                                            <CategoryDistributionChart data={dashboardData.analytics?.categoryDistribution} />
                                        </div>
                                    </div>
                                </div>

                                {/* Lists Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Recently Added */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                        <h3 className="text-lg font-medium text-dark-900 mb-4 font-serif">Recently Added Products</h3>
                                        {dashboardData.recentProducts?.length > 0 ? (
                                            <div className="space-y-3">
                                                {dashboardData.recentProducts.map(rp => (
                                                    <div key={rp._id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100">
                                                        <div className="flex items-center gap-3 truncate">
                                                            {rp.imageURL || rp.images?.[0] ? (
                                                                <img src={rp.imageURL || rp.images[0]} alt="" className="w-10 h-10 object-contain rounded bg-white p-1 flex-shrink-0 border border-slate-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center flex-shrink-0">
                                                                    <FiPackage className="text-slate-400" />
                                                                </div>
                                                            )}
                                                            <div className="truncate">
                                                                <p className="text-sm font-medium text-dark-900 truncate">{rp.title}</p>
                                                                <p className="text-xs text-slate-500">{rp.category || 'Uncategorized'} • {new Date(rp.createdAt).toLocaleDateString()}</p>
                                                                <p className="text-[10px] text-brand-600 font-bold">{getPriceDisplay(rp.price, rp.currency)}</p>
                                                            </div>
                                                        </div>
                                                        <Link to={`/product/${rp._id}`} className="text-xs font-medium text-brand-600 hover:underline flex-shrink-0 ml-4">
                                                            View
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No recent activity found.</p>
                                        )}
                                    </div>

                                    {/* Top Expensive Products */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                        <h3 className="text-lg font-medium text-dark-900 mb-4 font-serif">Highest Value Products</h3>
                                        {dashboardData.analytics?.topExpensiveProducts?.length > 0 ? (
                                            <div className="space-y-3">
                                                {dashboardData.analytics.topExpensiveProducts.map(rp => (
                                                    <div key={rp._id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100">
                                                        <div className="flex items-center gap-3 truncate">
                                                            {rp.imageURL || rp.images?.[0] ? (
                                                                <img src={rp.imageURL || rp.images[0]} alt="" className="w-10 h-10 object-contain rounded bg-white p-1 flex-shrink-0 border border-slate-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center flex-shrink-0">
                                                                    <FiDollarSign className="text-slate-400" />
                                                                </div>
                                                            )}
                                                            <div className="truncate">
                                                                <p className="text-sm font-medium text-dark-900 truncate">{rp.title}</p>
                                                                <p className="text-xs text-brand-600 font-medium">{getPriceDisplay(rp.price, rp.currency)}</p>
                                                            </div>
                                                        </div>
                                                        <Link to={`/product/${rp._id}`} className="text-xs font-medium text-brand-600 hover:underline flex-shrink-0 ml-4">
                                                            View
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No products found.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                <p className="text-red-700">Error loading dashboard statistics.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'single' && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-serif text-dark-900 mb-2">Manual Product Details</h3>
                            <p className="text-sm text-slate-500">Fill this out if you want to manually set every detail, or use the "Magic Quick Add" on the dashboard for a faster experience.</p>
                        </div>

                        {success && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-xl">
                                <FiCheck className="flex-shrink-0" /> {success}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
                        )}

                        {/* Identification Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">1. Amazon Identity</h4>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="amazonLink" className="block text-sm font-medium text-slate-700 mb-1">
                                        Amazon URL
                                    </label>
                                    <input
                                        id="amazonLink"
                                        name="amazonLink"
                                        type="url"
                                        placeholder="Paste full link here..."
                                        value={form.amazonLink}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="asin" className="block text-sm font-medium text-slate-700 mb-1">Product Identifier (ASIN) *</label>
                                    <input
                                        id="asin"
                                        name="asin"
                                        type="text"
                                        required
                                        placeholder="e.g. B08XMW..."
                                        value={form.asin}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">2. Display Content</h4>
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    placeholder="What should the customer see?"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Tell the user more about this product..."
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                            </div>

                            <div>
                                <label htmlFor="imageURL" className="block text-sm font-medium text-slate-700 mb-1">Main Image URL</label>
                                <input
                                    id="imageURL"
                                    name="imageURL"
                                    type="url"
                                    placeholder="Link to product photo..."
                                    value={form.imageURL}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                                {form.imageURL && (
                                    <div className="mt-2 bg-slate-50 p-2 rounded-xl inline-block">
                                        <img src={form.imageURL} alt="Preview" className="h-24 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing and Category */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">3. Pricing & Category</h4>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Retail Price</label>
                                    <div className="relative group">
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={form.price}
                                            onChange={handleChange}
                                            className="w-full pl-4 pr-16 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <select
                                                name="currency"
                                                value={form.currency}
                                                onChange={handleChange}
                                                className="bg-transparent border-none text-slate-500 font-bold text-sm focus:ring-0 cursor-pointer pr-6"
                                            >
                                                <option value="EGP">EGP</option>
                                                <option value="USD">USD</option>
                                                <option value="GBP">GBP</option>
                                                <option value="EUR">EUR</option>
                                                <option value="SAR">SAR</option>
                                                <option value="AED">AED</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Store Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                    >
                                        <option value="">Select a category</option>
                                        {categoryOptions.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                        <option value="_other_">Other (add custom)</option>
                                    </select>
                                    {form.category === '_other_' && (
                                        <input
                                            name="categoryOther"
                                            type="text"
                                            placeholder="New category name"
                                            value={form.categoryOther}
                                            onChange={handleChange}
                                            className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="salePrice" className="block text-sm font-medium text-slate-700 mb-1">
                                        Sale Price (Optional)
                                    </label>
                                    <input
                                        id="salePrice"
                                        name="salePrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Discounted price..."
                                        value={form.salePrice}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                                        <input
                                            id="isOnSale"
                                            name="isOnSale"
                                            type="checkbox"
                                            checked={form.isOnSale}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                        />
                                        <label htmlFor="isOnSale" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                            Apply "Sale" Badge
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special Actions */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">4. Extra Settings</h4>
                            <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-xl border border-brand-100">
                                <input
                                    id="isFeatured"
                                    name="isFeatured"
                                    type="checkbox"
                                    checked={form.isFeatured}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                                />
                                <label htmlFor="isFeatured" className="text-sm font-bold text-brand-800 cursor-pointer select-none">
                                    Show on Homepage (Featured Recommendation)
                                </label>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 bg-dark-900 text-white py-5 rounded-2xl font-bold hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <>
                                        {editingId ? <FiCheck size={20} /> : <FiPlus size={20} />}
                                        {editingId ? 'Update Product Details' : 'Save & Publish Product'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'bulk' && !editingId && (
                    <form onSubmit={handleBulkSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                        {success && (
                            <div className="p-4 bg-green-50 text-green-800 rounded-xl">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
                        )}
                        <div>
                            <label htmlFor="bulkInput" className="block text-sm font-medium text-slate-700 mb-2">
                                Paste Amazon Links or ASINs (one per line)
                            </label>
                            <textarea
                                id="bulkInput"
                                rows={8}
                                placeholder={`https://amzn.to/example1\nB0OPPORENO15\nhttps://www.amazon.eg/dp/B08XMW`}
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Automatically scrapes full product details from Amazon. Max 10 per batch recommended.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={bulkSyncMutation.isPending || !bulkInput.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-dark-900 text-white py-3 rounded-xl font-medium hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {bulkSyncMutation.isPending ? 'Scraping securely...' : 'Run Bulk Import'}
                        </button>
                    </form>
                )}

                <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-serif text-dark-900 flex items-center gap-2">
                                <FiPackage className="text-brand-600" /> Your Products <span className="text-slate-400 font-sans text-sm font-medium">({pagination.total || 0})</span>
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search ASIN or title..."
                                        value={listSearch}
                                        onChange={(e) => { setListSearch(e.target.value); setListPage(1); }}
                                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400 w-full sm:w-64"
                                    />
                                    <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                </div>

                                <select
                                    value={listCategory}
                                    onChange={(e) => { setListCategory(e.target.value); setListPage(1); }}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                >
                                    <option value="">All Categories</option>
                                    {categoryOptions.filter(c => c !== '_other_').map((name) => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        {isProductsLoading ? (
                            <div className="py-12 text-center text-slate-500 animate-pulse">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-slate-500 mb-2">No products found.</p>
                                {(listSearch || listCategory) && (
                                    <button
                                        onClick={() => { setListSearch(''); setListCategory(''); setListPage(1); }}
                                        className="text-brand-600 font-medium hover:underline text-sm"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <ul className="divide-y divide-slate-100">
                                    {products.map((p) => (
                                        <li key={p._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={p.images?.[0] || p.imageURL || 'https://placehold.co/48x48?text=?'}
                                                    alt=""
                                                    className="w-14 h-14 object-contain rounded-xl bg-slate-50 border border-slate-100"
                                                />
                                                {p.isOnSale && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Link to={`/product/${p._id}`} className="font-semibold text-dark-900 hover:text-brand-600 truncate block">
                                                        {p.title}
                                                    </Link>
                                                    {p.isFeatured && (
                                                        <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">Featured</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-full">{p.asin}</span>
                                                    <span>{p.category || 'Uncategorized'}</span>
                                                    <span className="text-brand-600 font-bold">{getPriceDisplay(p.price, p.currency)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditClick(p)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                                    title="Edit Product"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(p._id, p.title)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Delete Product"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                                <Link
                                                    to={`/product/${p._id}`}
                                                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                                                    title="View in Store"
                                                >
                                                    <FiPackage size={14} />
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Pagination Controls */}
                                <Pagination 
                                    pagination={pagination} 
                                    currentPage={listPage} 
                                    onPageChange={setListPage} 
                                    limit={listLimit} 
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
