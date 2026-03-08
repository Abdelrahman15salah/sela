import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from './lib/api';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import NotFound from './pages/NotFound';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';

function App() {
    useEffect(() => {
        // Track unique session visit
        if (!sessionStorage.getItem('visited')) {
            api.post('/analytics/visit').catch(console.error);
            sessionStorage.setItem('visited', 'true');
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
