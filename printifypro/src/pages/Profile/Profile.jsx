import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
// Font Awesome
import { 
  FaUser, FaEdit, FaHistory, FaHeart, FaMapMarkerAlt,
  FaCreditCard, FaSignOutAlt, FaPlus, FaTrash 
} from 'react-icons/fa';

// Simple Icons
import { 
  SiVisa, SiMastercard, SiAmericanexpress, 
  SiPaypal, SiBankofamerica, SiChase, SiWellsfargo 
} from 'react-icons/si';
import './Profile.css';

const Profile = () => {
  const { user: contextUser, clearCart } = useCart();
  const [user, setUser] = useState(contextUser || JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || ''
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'visa', last4: '4242', bank: 'Chase', expiry: '12/25', default: true },
    { id: 2, type: 'mastercard', last4: '5555', bank: 'Bank of America', expiry: '06/24', default: false },
    { id: 3, type: 'amex', last4: '1005', bank: 'American Express', expiry: '03/26', default: false },
  ]);
  
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'visa',
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    bank: 'chase',
    default: false
  });
  
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) {
        setUser(savedUser);
        setFormData({
          name: savedUser.name || '',
          email: savedUser.email || '',
          address: savedUser.address || '',
          phone: savedUser.phone || ''
        });
      }
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearCart();
    window.location.href = '/login';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentMethod(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.cardNumber.length !== 16 || 
        !newPaymentMethod.expiry || 
        !newPaymentMethod.cvv || 
        !newPaymentMethod.name) {
      alert('Please fill all payment details correctly');
      return;
    }

    const last4 = newPaymentMethod.cardNumber.slice(-4);
    const newMethod = {
      id: Date.now(),
      type: newPaymentMethod.type,
      last4,
      bank: newPaymentMethod.bank,
      expiry: newPaymentMethod.expiry,
      default: newPaymentMethod.default,
      name: newPaymentMethod.name
    };

    // If setting as default, update all others to non-default
    if (newMethod.default) {
      setPaymentMethods(prev => 
        prev.map(method => ({ ...method, default: false }))
      );
    }

    setPaymentMethods(prev => [...prev, newMethod]);
    setNewPaymentMethod({
      type: 'visa',
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: '',
      bank: 'chase',
      default: false
    });
    setAddingPayment(false);
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        default: method.id === id
      }))
    );
  };

  const handleDeletePayment = (id) => {
    if (paymentMethods.find(m => m.id === id)?.default && paymentMethods.length > 1) {
      alert('Please set another card as default before deleting this one');
      return;
    }
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const getBankIcon = (bank) => {
    switch (bank.toLowerCase()) {
      case 'chase': return <SiChase className="bank-icon" />;
      case 'bank of america': return <SiBankofamerica className="bank-icon" />;
      case 'wells fargo': return <SiWellsfargo className="bank-icon" />;
      default: return <div className="generic-bank-icon">{bank.charAt(0)}</div>;
    }
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa': return <SiVisa className="card-icon visa" />;
      case 'mastercard': return <SiMastercard className="card-icon mastercard" />;
      case 'amex': return <SiAmericanexpress className="card-icon amex" />;
      case 'paypal': return <SiPaypal className="card-icon paypal" />;
      default: return <FaCreditCard className="card-icon generic" />;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h3>{user?.name || 'User'}</h3>
          <p>{user?.email || 'user@example.com'}</p>
        </div>

        <nav className="profile-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <FaUser /> Overview
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <FaHistory /> Order History
          </button>
          <button 
            className={activeTab === 'wishlist' ? 'active' : ''}
            onClick={() => setActiveTab('wishlist')}
          >
            <FaHeart /> Wishlist
          </button>
          <button 
            className={activeTab === 'addresses' ? 'active' : ''}
            onClick={() => setActiveTab('addresses')}
          >
            <FaMapMarkerAlt /> Addresses
          </button>
          <button 
            className={activeTab === 'payments' ? 'active' : ''}
            onClick={() => setActiveTab('payments')}
          >
            <FaCreditCard /> Payment Methods
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="profile-overview">
            <div className="profile-section-header">
              <h2>Account Overview</h2>
              {!editing ? (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave}>Save</button>
                  <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <div className="detail-item">
                  <h4>Full Name</h4>
                  <p>{user?.name || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <h4>Email Address</h4>
                  <p>{user?.email || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <h4>Shipping Address</h4>
                  <p>{user?.address || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <h4>Phone Number</h4>
                  <p>{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            )}

            <div className="profile-stats">
              <div className="stat-card">
                <h4>Total Orders</h4>
                <p>12</p>
              </div>
              <div className="stat-card">
                <h4>Wishlist Items</h4>
                <p>5</p>
              </div>
              <div className="stat-card">
                <h4>Account Created</h4>
                <p>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payment-methods-section">
            <div className="profile-section-header">
              <h2>Payment Methods</h2>
              <button 
                className="edit-btn" 
                onClick={() => setAddingPayment(!addingPayment)}
              >
                <FaPlus /> {addingPayment ? 'Cancel' : 'Add Payment Method'}
              </button>
            </div>

            {addingPayment && (
              <div className="add-payment-method">
                <h3>Add New Payment Method</h3>
                <div className="payment-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Card Type</label>
                      <select 
                        name="type" 
                        value={newPaymentMethod.type}
                        onChange={handlePaymentInputChange}
                      >
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Bank</label>
                      <select 
                        name="bank" 
                        value={newPaymentMethod.bank}
                        onChange={handlePaymentInputChange}
                      >
                        <option value="chase">Chase</option>
                        <option value="bank of america">Bank of America</option>
                        <option value="wells fargo">Wells Fargo</option>
                        <option value="citibank">Citibank</option>
                        <option value="us bank">U.S. Bank</option>
                        <option value="other">Other Bank</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={newPaymentMethod.cardNumber}
                      onChange={handlePaymentInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="16"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={newPaymentMethod.expiry}
                        onChange={handlePaymentInputChange}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={newPaymentMethod.cvv}
                        onChange={handlePaymentInputChange}
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newPaymentMethod.name}
                      onChange={handlePaymentInputChange}
                      placeholder="Name on card"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="default-payment"
                      name="default"
                      checked={newPaymentMethod.default}
                      onChange={(e) => setNewPaymentMethod(prev => ({
                        ...prev,
                        default: e.target.checked
                      }))}
                    />
                    <label htmlFor="default-payment">Set as default payment method</label>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="save-btn"
                      onClick={handleAddPaymentMethod}
                    >
                      Save Payment Method
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setAddingPayment(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="payment-methods-list">
              {paymentMethods.length === 0 ? (
                <p className="no-payments">No payment methods saved</p>
              ) : (
                paymentMethods.map(method => (
                  <div 
                    key={method.id} 
                    className={`payment-method-card ${method.default ? 'default' : ''}`}
                  >
                    <div className="payment-method-header">
                      {getCardIcon(method.type)}
                      {getBankIcon(method.bank)}
                      <span className="payment-method-type">
                        {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                      </span>
                      {method.default && (
                        <span className="default-badge">DEFAULT</span>
                      )}
                    </div>
                    
                    <div className="payment-method-details">
                      <div className="card-number">
                        •••• •••• •••• {method.last4}
                      </div>
                      <div className="card-expiry">
                        Expires {method.expiry}
                      </div>
                      {method.name && (
                        <div className="cardholder-name">
                          {method.name}
                        </div>
                      )}
                      <div className="bank-name">
                        {method.bank}
                      </div>
                    </div>

                    <div className="payment-method-actions">
                      {!method.default && (
                        <button 
                          className="set-default-btn"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeletePayment(method.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="profile-orders">
            <h2>Order History</h2>
            <div className="orders-list">
              <div className="order-card">
                <div className="order-header">
                  <span>Order #12345</span>
                  <span className="order-status">Delivered</span>
                </div>
                <div className="order-details">
                  <div className="order-products">
                    <img src="/product1.jpg" alt="Product" />
                    <img src="/product2.jpg" alt="Product" />
                    <span>+3 more</span>
                  </div>
                  <div className="order-summary">
                    <span>Total: $149.99</span>
                    <span>Ordered on: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="order-actions">
                  <button className="btn-outline">View Details</button>
                  <button className="btn-primary">Reorder</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;