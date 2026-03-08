import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useProducts, useCategories } from '../hooks/useProducts';
import { FiPlus, FiCheck, FiPackage, FiEdit2, FiTrash2, FiX, FiList, FiTrendingUp, FiLogOut, FiDollarSign } from 'react-icons/fi';
import { ProductsOverTimeChart, CategoryDistributionChart } from '../components/AdminDashboardCharts';

const parseAsinFromUrl = (url) => {
    if (!url) return '';
    try {
        const match = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/i);
        return match ? (match[1] || match[2]) : '';
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



const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'single', or 'bulk'
    const [form, setForm] = useState(initialForm);
    const [bulkInput, setBulkInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

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

    const { data: products = [] } = useProducts();
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
        if (name === 'amazonLink' && value) {
            const asin = parseAsinFromUrl(value);
            if (asin && !form.asin) setForm((prev) => ({ ...prev, asin }));
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
                                                                <p className="text-xs text-brand-600 font-medium">{rp.price ? `${rp.price.toLocaleString()} EGP` : 'Price N/A'}</p>
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
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                        {success && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-xl">
                                <FiCheck className="flex-shrink-0" /> {success}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
                        )}

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="amazonLink" className="block text-sm font-medium text-slate-700 mb-1">
                                    Amazon URL <span className="text-slate-400">(paste full link)</span>
                                </label>
                                <input
                                    id="amazonLink"
                                    name="amazonLink"
                                    type="url"
                                    placeholder="https://www.amazon.eg/dp/B0OPPORENO15"
                                    value={form.amazonLink}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                                <p className="text-xs text-slate-400 mt-1">ASIN will be extracted automatically if you paste the link first</p>
                            </div>

                            <div>
                                <label htmlFor="asin" className="block text-sm font-medium text-slate-700 mb-1">ASIN *</label>
                                <input
                                    id="asin"
                                    name="asin"
                                    type="text"
                                    required
                                    placeholder="B0OPPORENO15"
                                    value={form.asin}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Product Title *</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                placeholder="Oppo Reno 15 Pro 5G"
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
                                placeholder="Brief product description..."
                                value={form.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Base Price</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="67999"
                                    value={form.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                            </div>
                            <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                >
                                    <option value="EGP">EGP</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="salePrice" className="block text-sm font-medium text-slate-700 mb-1">
                                    Sale Price (optional)
                                </label>
                                <input
                                    id="salePrice"
                                    name="salePrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="59999"
                                    value={form.salePrice}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    If set lower than the base price, the product will be marked as on sale.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    id="isOnSale"
                                    name="isOnSale"
                                    type="checkbox"
                                    checked={form.isOnSale}
                                    onChange={handleChange}
                                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                                <label htmlFor="isOnSale" className="text-sm text-slate-700">
                                    Mark as on sale
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="imageURL" className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                            <input
                                id="imageURL"
                                name="imageURL"
                                type="url"
                                placeholder="https://m.media-amazon.com/images/I/..."
                                value={form.imageURL}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                            />
                            {form.imageURL && (
                                <div className="mt-2">
                                    <img src={form.imageURL} alt="Preview" className="h-24 object-contain border border-slate-100 rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
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
                                    placeholder="Enter category name"
                                    value={form.categoryOther}
                                    onChange={handleChange}
                                    className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="isFeatured"
                                name="isFeatured"
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={handleChange}
                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <label htmlFor="isFeatured" className="text-sm text-slate-700">Show on homepage (featured)</label>
                        </div>

                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {createMutation.isPending || updateMutation.isPending ? (
                                editingId ? 'Updating...' : 'Adding...'
                            ) : (
                                <>
                                    {editingId ? <FiCheck /> : <FiPlus />} {editingId ? 'Update Product' : 'Add Product'}
                                </>
                            )}
                        </button>
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

                <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-serif text-dark-900 mb-4 flex items-center gap-2">
                        <FiPackage /> Your Products ({products.length})
                    </h2>
                    {products.length === 0 ? (
                        <p className="text-slate-500">No products yet. Add your first one above.</p>
                    ) : (
                        <ul className="space-y-3">
                            {products.slice(0, 10).map((p) => (
                                <li key={p._id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                                    <img
                                        src={p.images?.[0] || p.imageURL || 'https://placehold.co/48x48?text=?'}
                                        alt=""
                                        className="w-12 h-12 object-contain rounded-lg bg-slate-50"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/product/${p._id}`} className="font-medium text-dark-900 hover:text-brand-600 truncate block">
                                            {p.title}
                                        </Link>
                                        <span className="text-sm text-slate-500">{p.category || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(p)}
                                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(p._id, p.title)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                            disabled={deleteMutation.isPending}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                        <Link to={`/product/${p._id}`} className="text-sm text-brand-600 hover:underline ml-2">View →</Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {products.length > 10 && (
                        <p className="text-slate-500 text-sm mt-4">Showing 10 of {products.length} products</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
