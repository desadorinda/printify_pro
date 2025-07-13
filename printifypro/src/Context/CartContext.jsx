import { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../api';

const CartContext = createContext({
  cart: [],
  selectedDesign: null,
  isLoading: true,
  error: null,
  notification: null,
  cartTotal: 0,
  cartItemCount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  setError: () => {},
  setNotification: () => {},
  setSelectedDesign: () => {},
  clearDesignSelection: () => {},
  getTotalWithDesign: () => 0
});

// Helper: normalize backend cart items
const normalizeCartItems = (items) =>
  (items || []).map(item => {
    // If design_id is present, this is a design cart item
    if (item.design_id) {
      return {
        ...item,
        type: 'design',
        id: item.id || item.design_id,
        name: item.name || item.title || 'Design',
        image: item.image_url || item.image || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        description: item.description || '',
      };
    }
    // Otherwise, treat as product
    return {
      ...item,
      type: 'product',
      id: item.id || item.product_id,
      name: item.name || 'Product',
      image: item.image_url || item.image || '',
      price: item.price || 0,
      quantity: item.quantity || 1,
      description: item.description || '',
    };
  });

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Helper: is user logged in
  const getUser = () => {
    // Always get the latest token
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (!user.token && token) user.token = token;
      if (token) user.token = token; // Always overwrite with latest
      return user;
    }
    if (token) return { token };
    return null;
  };

  // On mount, always load cart from backend if logged in
  useEffect(() => {
    const loadCart = async () => {
      try {
        const user = getUser();
        if (user && user.token) {
          try {
            const res = await api.getUserCart(user.token);
            setCartItems(normalizeCartItems(res.data.cartItems));
            console.log('Loaded cart from backend:', normalizeCartItems(res.data.cartItems));
          } catch (err) {
            setCartItems([]);
            setError('Failed to fetch cart from backend');
            console.error('Cart fetch error:', err);
          }
        } else {
          // Not logged in: use localStorage cart
          const savedCart = localStorage.getItem('cart');
          setCartItems(savedCart ? JSON.parse(savedCart) : []);
        }
        const savedDesign = localStorage.getItem('selectedDesign');
        if (savedDesign) {
          setSelectedDesign(JSON.parse(savedDesign));
        }
      } catch {
        setError('Failed to load cart data');
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  // Persist cart and design to localStorage for guests only
  useEffect(() => {
    const user = getUser();
    if (!user || !user.token) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    if (selectedDesign) {
      localStorage.setItem('selectedDesign', JSON.stringify(selectedDesign));
    } else {
      localStorage.removeItem('selectedDesign');
    }
  }, [cartItems, selectedDesign]);

  // Add to cart (frontend only for guests, backend for logged-in)
  const addToCart = async (product, description = null) => {
    const user = getUser();
    if (user && user.token) {
      if (!user.token || user.token.length < 10) { // Defensive: token must be present and valid length
        setError('Session expired. Please log in again.');
        setNotification({ message: 'Session expired. Please log in again.', type: 'error' });
        return false;
      }
      // Logged in: call backend API
      try {
        let res;
        if (product.isDesign) {
          res = await api.addDesignToCart(product.id, user.token, product.quantity || 1, description);
        } else {
          res = await api.addToCart(product.id, user.token, product.quantity || 1, description);
        }
        await refreshCart(user.token);
        setNotification({
          message: `${product.name || product.title} added to cart`,
          type: 'add'
        });
        return true;
      } catch (err) {
        setError('Failed to add item to cart');
        setNotification({ message: 'Failed to add to cart', type: 'error' });
        return false;
      }
    } else {
      // Guest: show login/signup notification
      setNotification({ message: 'You have to login or sign up to add items to cart.', type: 'error' });
      return false;
    }
  };

  // Remove from cart (frontend only for guests)
  const removeFromCart = (productId, color, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === productId &&
        item.selectedSize === size &&
        JSON.stringify(item.selectedColors) === JSON.stringify(color))
      )
    );
  };

  // Update quantity (frontend only for guests)
  const updateQuantity = (productId, color, size, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId &&
        item.selectedSize === size &&
        JSON.stringify(item.selectedColors) === JSON.stringify(color)
          ? { 
              ...item, 
              quantity: newQuantity,
              price: item.originalPrice * newQuantity * 2
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const selectDesign = (design) => {
    const designWithNairaPrice = {
      ...design,
      nairaPrice: parseFloat(design.price.replace('$', '')) * 1000
    };
    setSelectedDesign(designWithNairaPrice);
    setNotification({
      message: `${design.title} design selected`,
      type: 'design'
    });
  };

  const clearDesignSelection = () => {
    setSelectedDesign(null);
  };

  // Calculate cart total and count from backend cart structure
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  const cartItemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

  const getTotalWithDesign = () => {
    return cartTotal + (selectedDesign?.nairaPrice || 0);
  };

  // Always fetch cart from backend for logged-in users
  const refreshCart = async (userToken) => {
    if (!userToken) return;
    try {
      const res = await api.getUserCart(userToken);
      setCartItems(normalizeCartItems(res.data.cartItems));
      console.log('Refreshed cart from backend:', normalizeCartItems(res.data.cartItems));
    } catch (err) {
      setCartItems([]);
      setError('Failed to refresh cart from backend');
      console.error('Cart refresh error:', err);
    }
  };

  // Backend-aware remove and update for logged-in users
  const removeFromCartBackend = async (cartItemId, token) => {
    if (!token) return;
    try {
      console.log('[CartContext] Calling removeFromCart API with:', cartItemId, token);
      const res = await api.removeFromCart(cartItemId, token);
      console.log('[CartContext] removeFromCart API response:', res);
      await refreshCart(token);
    } catch (err) {
      setError('Failed to remove from cart');
      console.error('Backend remove from cart error:', err);
    }
  };

  const updateQuantityBackend = async (cartItemId, newQuantity, token) => {
    if (!token) return;
    try {
      console.log('[CartContext] Calling updateCartQuantity API with:', cartItemId, newQuantity, token);
      const res = await api.updateCartQuantity(cartItemId, newQuantity, token);
      console.log('[CartContext] updateCartQuantity API response:', res);
      await refreshCart(token);
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Backend update quantity error:', err);
    }
  };

  // Update cart item description (for logged-in users and guests)
  const updateCartItemDescription = async (cartItemId, newDescription) => {
    const user = getUser();
    if (user && user.token) {
      // Backend: update description only (keep quantity the same)
      const item = cartItems.find(i => i.id === cartItemId);
      if (!item) return;
      try {
        await api.updateCartQuantity(cartItemId, item.quantity, user.token, newDescription);
        await refreshCart(user.token);
      } catch (err) {
        setError('Failed to update description');
      }
    } else {
      // Guest: update local cart
      setCartItems(prevItems => prevItems.map(item =>
        item.id === cartItemId ? { ...item, description: newDescription } : item
      ));
    }
  };

  // Expose globally for Cart.jsx textarea onChange
  if (typeof window !== 'undefined') {
    window.updateCartItemDescription = updateCartItemDescription;
  }

  useEffect(() => {
    console.log('[CartContext] cartItems after refresh:', cartItems);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        isLoading,
        error,
        cartTotal,
        cartItemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setError,
        notification,
        setNotification,
        selectedDesign,
        setSelectedDesign: selectDesign,
        clearDesignSelection,
        getTotalWithDesign,
        refreshCart,
        removeFromCartBackend,
        updateQuantityBackend,
        updateCartItemDescription, // Add to context for direct use
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};