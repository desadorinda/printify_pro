import { useState, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { CartProvider, useCart } from './Context/CartContext'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Products from './pages/Products/Products'
import Designs from './pages/Designs/Designs'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import AdminSignup from './pages/Signup/AdminSignUp'
import Cart from './pages/Cart/Cart'
import Checkout from './pages/Checkout/Checkout'
import Dashboard from './pages/Dashboard/Dashboard'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import Profile from './pages/Profile/Profile'
import Notification from './components/Notification/Notification'

// Design Categories
import * as api from './api'
import './App.css'
import AdminUsers from './pages/Dashboard/AdminUsers';
import AdminOrders from './pages/Dashboard/AdminOrders';
import AdminCollections from './pages/Dashboard/AdminCollections';
import AdminCartItems from './pages/Dashboard/AdminCartItems';
import AdminReviews from './pages/Dashboard/AdminReviews';
import AdminSettings from './pages/Dashboard/AdminSettings';
import ProductsByCollection from './pages/Dashboard/ProductsByCollection';
// import ProductDetails from './ProductDetails';
import ProductDetails from './pages/Dashboard/ProductDetails'
import ProductLikes from './pages/Dashboard/ProductLikes';
import ProductReviews from './pages/Dashboard/ProductReviews';
import ProductOrders from './pages/Dashboard/ProductOrders';
import AdminOrderDetails from './pages/Dashboard/AdminOrderDetails';
import AdminCustomDesignRequests from './pages/Dashboard/AdminCustomDesignRequests';
import AdminOutlines from './pages/Dashboard/AdminOutlines';
import OutlineDesigns from './pages/Dashboard/OutlineDesigns';

const Layout = ({ user, onLogout }) => {
  const { notification, setNotification, cartItemCount } = useCart()
  
  return (
    <div className="app">
      <Navbar user={user} cartCount={cartItemCount} onLogout={onLogout} />
      <Outlet />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

function App() {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage for instant UI
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.setAuthToken(token);
          const userData = await api.getCurrentUser();
          console.log('Fetched user from /auth/me:', userData); // DEBUG
          if (userData && (userData.id || userData._id)) {
            setUser(userData);
            setUserError("");
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            setUser(null);
            setUserError("User not found or invalid response from backend.");
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
          setUserError("");
        }
      } catch (err) {
        console.error('Error initializing user:', err);
        setUserError("Failed to load user. Please log in again.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeUser();
  }, []);

  // const handleLogin = async (userData) => {
  //   try {
  //     const { token, user } = await api.login(userData)
  //     setUser(user)
  //     localStorage.setItem('user', JSON.stringify(user))
  //     localStorage.setItem('token', token)
  //     api.setAuthToken(token)
  //     return { success: true }
  //   } catch (err) {
  //     console.error('Login error:', err)
  //     throw err
  //   }
  // }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    api.setAuthToken(null)
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  if (userError) {
    return <div style={{color:'#d9534f',padding:'2rem',fontWeight:600}}>{userError}</div>;
  }

  return (
    <CartProvider>
      <Routes>
        <Route 
          path="/" 
          element={<Layout user={user} onLogout={handleLogout} />}
        >
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="designs" element={<Designs />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin-dashboard" element={<AdminDashboard user={user} />}> 
            <Route path="users" element={<AdminUsers />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="collections/:collectionId/products" element={<ProductsByCollection />} />
            <Route path="products/:productId" element={<ProductDetails />} />
            <Route path="cart-items" element={<AdminCartItems />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="likes" element={<ProductLikes />} />
            <Route path="reviews" element={<ProductReviews />} />
            <Route path="orders" element={<ProductOrders />} />
            <Route path="products/:productId/likes" element={<ProductLikes />} />
            <Route path="products/:productId/reviews" element={<ProductReviews />} />
            <Route path="products/:productId/orders" element={<ProductOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetails />} />
            <Route path="custom-design-requests" element={<AdminCustomDesignRequests />} />
            <Route path="outline" element={<AdminOutlines />} />
            <Route path="admin/outlines/:outlineId/designs" element={<OutlineDesigns />} />
            {/* Removed <Route path="works" element={<AdminWorks />} /> */}
          </Route>
          <Route path="product/:productId" element={<ProductDetails />} />
        </Route>
        <Route path="/login" element={<Login onLogin={api.login} setUser={setUser} />} />
        <Route path="/signup" element={<Signup onRegister={api.register} />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
      </Routes>
    </CartProvider>
  )
}

export default App