import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('sela_wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error('Failed to parse wishlist from localStorage', e);
                setWishlist([]);
            }
        }
    }, []);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('sela_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product) => {
        setWishlist((prev) => {
            if (prev.find((p) => (p._id || p.asin) === (product._id || product.asin))) {
                return prev;
            }
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlist((prev) => prev.filter((p) => (p._id || p.asin) !== productId));
    };

    const isInWishlist = (productId) => {
        return wishlist.some((p) => (p._id || p.asin) === productId);
    };

    const toggleWishlist = (product) => {
        const productId = product._id || product.asin;
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
