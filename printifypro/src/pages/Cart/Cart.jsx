import React, { useEffect, useState } from 'react';
import { FaTimes, FaTrash, FaShoppingBag, FaPalette } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../../config";
import './Cart.css';
import { useCart } from '../../Context/CartContext';
import { removeFromCart as apiRemoveFromCart, updateCartQuantity as apiUpdateCartQuantity } from '../../api';

const Cart = () => {
  const {
    cart: cartItems,
    isLoading: cartLoading,
    error: cartError,
    removeFromCart: contextRemoveFromCart,
    updateQuantity: contextUpdateQuantity,
    refreshCart,
  } = useCart();
  const navigate = useNavigate();
  const shippingCost = 5000;
  const [localLoading, setLocalLoading] = React.useState(true);

  // Local state for cart item descriptions
  const [descState, setDescState] = React.useState({});

  // On mount, always refresh cart from backend if user is logged in
  useEffect(() => {
    const fetchUserCart = async () => {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user && user.token && refreshCart) {
        await refreshCart(user.token);
        setLocalLoading(false);
        setTimeout(() => {
          console.log('Cart items after refreshCart:', cartItems);
        }, 100);
      } else {
        setLocalLoading(false);
      }
    };
    fetchUserCart();
    // eslint-disable-next-line
  }, []); // Only run on mount

  useEffect(() => {
    // Log cartItems whenever they change
    console.log('[Cart.jsx] cartItems:', cartItems);
    // Log all cart item IDs for debugging
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item, idx) => {
        console.log(`[Cart.jsx] Cart item #${idx + 1} - id:`, item.id, 'name:', item.name);
      });
      // Log the full cartItems array as JSON for copy-paste
      console.log('[Cart.jsx] FULL CART DATA:', JSON.stringify(cartItems, null, 2));
    }
  }, [cartItems]);

  // Sync local state with cart items when cart changes
  React.useEffect(() => {
    const newState = {};
    cartItems.forEach(item => {
      newState[item.id] = item.description || '';
    });
    setDescState(newState);
  }, [cartItems]);

  // Handler for textarea change
  const handleDescChange = (cartItemId, value) => {
    setDescState(prev => ({ ...prev, [cartItemId]: value }));
  };

  // Handler for textarea blur (persist to backend)
  const handleDescBlur = (cartItemId) => {
    if (typeof window !== 'undefined' && window.updateCartItemDescription) {
      window.updateCartItemDescription(cartItemId, descState[cartItemId] || '');
    }
  };

  // Helper function to safely format prices
  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

const handleQuantityChange = async (cartItemId, newQuantity) => {
  console.log('[Cart.jsx] handleQuantityChange called', cartItemId, newQuantity);
  if (newQuantity < 1) return;
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  // Try to get token from user object or localStorage
  const token = (user && user.token) ? user.token : localStorage.getItem('token');

  if (token) {
    console.log('[Cart.jsx] LOGGED IN USER - will call API');
    try {
      console.log('[Cart.jsx] calling apiUpdateCartQuantity', cartItemId, newQuantity, token);
      const res = await apiUpdateCartQuantity(cartItemId, newQuantity, token);
      console.log('[Cart.jsx] apiUpdateCartQuantity response', res);
      if (res?.data?.success) {
        await refreshCart(token);
      } else {
        alert(res?.data?.error || "Failed to update cart item.");
      }
    } catch (error) {
      console.error('[Cart.jsx] updateCartQuantity error', error);
      alert(error?.response?.data?.error || "Failed to update cart item.");
    }
  } else {
    console.log('[Cart.jsx] GUEST USER - will call contextUpdateQuantity');
    // For guests, update local cart
    contextUpdateQuantity(cartItemId, newQuantity);
  }
};

const handleRemove = async (cartItemId) => {
  // Confirmation dialog before removing
  const confirmDelete = window.confirm('Are you sure you want to remove this item from your cart?');
  if (!confirmDelete) return;

  console.log('[Cart.jsx] handleRemove called', cartItemId);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  // Try to get token from user object or localStorage
  const token = (user && user.token) ? user.token : localStorage.getItem('token');

  if (token) {
    console.log('[Cart.jsx] LOGGED IN USER - will call API');
    try {
      console.log('[Cart.jsx] calling apiRemoveFromCart', cartItemId, token);
      const res = await apiRemoveFromCart(cartItemId, token);
      console.log('[Cart.jsx] apiRemoveFromCart response', res);
      if (res?.data?.success) {
        await refreshCart(token);
      } else {
        alert(res?.data?.error || "Failed to remove cart item.");
      }
    } catch (error) {
      console.error('[Cart.jsx] removeFromCart error', error);
      alert(error?.response?.data?.error || "Failed to remove cart item.");
    }
  } else {
    console.log('[Cart.jsx] GUEST USER - will call contextRemoveFromCart');
    // For guests, update local cart
    contextRemoveFromCart(cartItemId);
  }
};

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout', { state: { cartItems } });
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWithShipping = cartTotal + shippingCost;

  if (cartLoading || localLoading) {
    return (
      <div className="cart-container">
        <div className="cart-floating-card">
          <div className="loading-cart">
            <div className="spinner"></div>
            <p>Loading your shopping bag...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-floating-card">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p>Your fashion bag is empty</p>
            <small>Start adding some luxury items</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-floating-card">
        <div className="cart-header">
          <h2 className="cart-title">
            <FaShoppingBag className="cart-icon" />
            Your Shopping Bag
            <span className="cart-count">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
        </div>
        {cartError && <div className="cart-error">{cartError}</div>}
        <div className="cart-items-container">
          {cartItems.map(item => (
            <div key={item.id || item.design_id || item.product_id} className="cart-item">
              <div className="item-image-container">
                <img 
                  src={item.image && item.image.startsWith('/uploads')
                    ? API_BASE_URL.replace(/\/api$/, '') + item.image
                    : item.image || item.image_url || '/assets/products/placeholder.jpg'}
                  alt={item.name || item.title || 'Design'}
                  className="item-image"
                  onError={e => {
                    e.target.src = '/assets/products/placeholder.jpg';
                  }}
                />
                {item.type === 'design' || item.design_id ? (
                  <span className="cart-type-label" style={{position:'absolute',top:4,left:4,background:'#FFD700',color:'#222',padding:'2px 8px',borderRadius:6,fontSize:12,fontWeight:700}}>Design</span>
                ) : (
                  <span className="cart-type-label" style={{position:'absolute',top:4,left:4,background:'#222',color:'#FFD700',padding:'2px 8px',borderRadius:6,fontSize:12,fontWeight:700}}>Product</span>
                )}
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name || item.title || 'Design'}</h3>
                {/* Show design placement if present */}
                {item.placement && (
                  <div className="item-placement" style={{ fontSize: 13, color: '#555', margin: '2px 0' }}>
                    <strong>Placement:</strong> {item.placement}
                  </div>
                )}
                {/* Show user description if present */}
                {/* Description textarea for user input (for products only) */}
                {(!item.type || item.type === 'product') && (
                  <div className="item-description-input" style={{ margin: '8px 0' }}>
                    <label htmlFor={`cart-desc-${item.id || item.product_id}`} style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>Describe what you want:</label>
                    <textarea
                      id={`cart-desc-${item.id || item.product_id}`}
                      value={descState[item.id] ?? item.description ?? ''}
                      onChange={e => handleDescChange(item.id, e.target.value)}
                      onBlur={() => handleDescBlur(item.id)}
                      placeholder="e.g. Add a gold logo on the back, change color, etc."
                      style={{ width: '100%', minHeight: 60, padding: 6, borderRadius: 5, border: '1px solid #ccc', fontSize: 14, marginTop: 2 }}
                    />
                  </div>
                )}
                {/* Show user description if present (for designs or after input) */}
                {item.type === 'design' && item.description && (
                  <div className="item-description" style={{ fontSize: 13, color: '#555', margin: '2px 0' }}>
                    <strong>Description:</strong> {item.description}
                  </div>
                )}
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(item.id || item.design_id || item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id || item.design_id || item.product_id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <div className="item-price-quantity">
                  <span className="item-price">₦{formatPrice(item.price)}</span>
                  <span className="item-subtotal">
                    (₦{formatPrice(item.price)} × {item.quantity})
                  </span>
                </div>
              </div>
              <button 
                className="remove-item-button"
                onClick={() => handleRemove(item.id || item.design_id || item.product_id)}
              >
                <FaTrash className="trash-icon" />
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₦{formatPrice(cartTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>₦{formatPrice(shippingCost)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₦{formatPrice(totalWithShipping)}</span>
          </div>
          <button 
            className="checkout-button"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;