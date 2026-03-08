import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useProducts = ({ category, search, isFeatured } = {}) => {
    return useQuery({
        queryKey: ['products', { category, search, isFeatured }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (search) params.append('search', search);
            if (isFeatured) params.append('isFeatured', isFeatured);
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
