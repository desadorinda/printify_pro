import { useEffect, useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../../api';
import { PaystackButton } from 'react-paystack';
import './Checkout.css';

const Checkout = () => {
  // Only keep fields required by backend/database
  const [form, setForm] = useState({
    recipient_name: '',
    phone: '',
    email: '',
    shipping_address: '',
    payment_method: 'card',
    notes: ''
  });
  const [cartSummary, setCartSummary] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemsFromCart = location.state?.cartItems;
  const [user] = useState(() => {
    const stored = localStorage.getItem('user');
    let userObj = stored ? JSON.parse(stored) : null;
    // Always try to get token from localStorage if not present in user object
    const token = (userObj && userObj.token) ? userObj.token : localStorage.getItem('token');
    if (userObj) {
      userObj.token = token;
      return userObj;
    } else if (token) {
      return { token };
    } else {
      return null;
    }
  });

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError('');
      if (!user || !user.token) {
        setCartSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
        setLoading(false);
        return;
      }
      try {
        let items = [];
        if (cartItemsFromCart && cartItemsFromCart.length > 0) {
          items = cartItemsFromCart;
        } else {
          const res = await api.getUserCart(user.token);
          items = res.data.cartItems || [];
        }
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 5000;
        const tax = Math.round(subtotal * 0.075);
        const total = subtotal + shipping + tax;
        setCartSummary({ subtotal, shipping, tax, total });
      } catch {
        setError('Failed to load cart.');
        setCartSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
    
  }, [user, cartItemsFromCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This is now handled by Paystack onSuccess
  };

  // Paystack config
  const paystackPublicKey = 'pk_live_34c76169ea2b594ba05c2c6dd0e793f13048320c'; // TODO: Replace with your real key
  const amountKobo = cartSummary.total * 100; // Paystack expects amount in kobo
  const paystackEmail = form.email;

  const paystackProps = {
    email: paystackEmail,
    amount: amountKobo,
    publicKey: paystackPublicKey,
    text: 'Pay with Paystack',
    onSuccess: async (reference) => {
      // After successful payment, finalize order in backend
      try {
        if (!user || !user.token) {
          setError('You must be logged in to place an order.');
          return;
        }
        // Basic validation
        if (!form.recipient_name || !form.phone || !form.email || !form.shipping_address || !form.payment_method) {
          setError('Please fill in all required fields.');
          return;
        }
        // Optionally send reference to backend for verification
        const res = await api.checkoutOrder({ ...form, paystack_reference: reference.reference }, user.token);
        if (res.status === 201 && res.data.orderId) {
          alert('Payment successful! Order placed.');
          navigate('/');
        } else {
          setError(res.data.error || 'Failed to place order.');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to place order.');
      }
    },
    onClose: () => {
      // Optionally handle payment modal close
    },
  };

  return (
    <div className="checkout-container">
      <div className="floating-elements">
        <span className="gold-glow"></span>
        <span className="gold-light"></span>
        <span className="gold-sparkle"></span>
      </div>

      <div className="checkout-card">
        <div className="checkout-header">
          <div className="header-content">
            <FaLock className="header-icon" />
            <h2>Secure Checkout</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <h3>Shipping & Contact Information</h3>
            </div>
            <div className="form-group">
              <label htmlFor="recipient_name">Recipient Name</label>
              <input
                type="text"
                id="recipient_name"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                required
                className="styled-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="styled-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="styled-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="shipping_address">Shipping Address</label>
              <input
                type="text"
                id="shipping_address"
                name="shipping_address"
                value={form.shipping_address}
                onChange={handleChange}
                required
                className="styled-input"
                placeholder="Full address including city, state, zip, country"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Order Notes (optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="styled-input"
                placeholder="Any special instructions?"
              />
            </div>
            <div className="form-group">
              <label htmlFor="payment_method">Payment Method</label>
              <select
                id="payment_method"
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                required
                className="styled-select"
              >
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Subtotal</span>
              <span>{loading ? <span className="loading-placeholder">Loading...</span> : `₦${cartSummary.subtotal.toLocaleString()}`}</span>
            </div>
            <div className="summary-item">
              <span>Shipping</span>
              <span>{loading ? <span className="loading-placeholder">Loading...</span> : `₦${cartSummary.shipping.toLocaleString()}`}</span>
            </div>
            <div className="summary-item">
              <span>Tax</span>
              <span>{loading ? <span className="loading-placeholder">Loading...</span> : `₦${cartSummary.tax.toLocaleString()}`}</span>
            </div>
            <div className="summary-item total">
              <span>Total</span>
              <span>{loading ? <span className="loading-placeholder">Loading...</span> : `₦${cartSummary.total.toLocaleString()}`}</span>
            </div>
          </div>

          <div className="security-notice">
            <FaLock className="security-icon" />
            <span>Your information is processed securely.</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <PaystackButton {...paystackProps} className="btn-place-order" />
        </form>
      </div>
    </div>
  );
};

export default Checkout;