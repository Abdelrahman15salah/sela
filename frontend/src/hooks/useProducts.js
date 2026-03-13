import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

function normalizeSearch(raw) {
    if (raw == null || typeof raw !== 'string') return '';
    return raw.trim();
}

export const useProducts = ({ category, search, isFeatured, page = 1, limit = 12, sortBy, order = 'desc' } = {}) => {
    const searchTerm = normalizeSearch(search);
    const hasSearch = searchTerm.length > 0;
    const effectiveSort = sortBy ?? (hasSearch ? 'relevance' : 'createdAt');

    return useQuery({
        queryKey: ['products', { category, search: searchTerm, isFeatured, page, limit, sortBy: effectiveSort, order }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (searchTerm) params.append('search', searchTerm);
            if (isFeatured) params.append('isFeatured', isFeatured);
            params.append('page', String(page));
            params.append('limit', String(limit));
            params.append('sortBy', effectiveSort);
            params.append('order', order);
            const { data } = await api.get(`/products?${params.toString()}`);
            return data;
        },
    });
};

export const useProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            return data;
        },
    });
};
