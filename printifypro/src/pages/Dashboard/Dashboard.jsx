import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import './Dashboard.css';
import './Dashboard.orders.css';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // Set default tab to 'overview'
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalCartItems: 0,
    totalOrders: 0,
    totalReviews: 0
  });
  const [likedProducts, setLikedProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState([]); // Track expanded order IDs
  const [orderItems, setOrderItems] = useState({}); // { orderId: [items] }
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState({ username: '', email: '' });
  const [updateStatus, setUpdateStatus] = useState('');
  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          setUser(null);
          return;
        }
        // Fetch current user info
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user || userData);
        } else {
          setUser(null);
          setIsLoading(false);
          return;
        }
        // Fetch user stats from backend
        const statsResponse = await fetch(`${API_BASE_URL}/users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } 
        // Fetch liked products for the user
        const likedRes = await fetch(`${API_BASE_URL}/users/liked-products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (likedRes.ok) {
          const likedData = await likedRes.json();
          setLikedProducts(likedData.products || []);
        } else {
          setLikedProducts([]);
        }
        // Fetch user orders
        const ordersRes = await fetch(`${API_BASE_URL}/users/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setUserOrders(ordersData.orders || []);
        } else {
          setUserOrders([]);
        }
        // Fetch user reviews
        const reviewsRes = await fetch(`${API_BASE_URL}/users/reviews`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        let userReviewsArr = [];
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          // Filter reviews to only those by the logged-in user (if backend does not already do this)
          if (Array.isArray(reviewsData.reviews)) {
            if (user && user.id) {
              userReviewsArr = reviewsData.reviews.filter(r => r.user_id === user.id);
            } else {
              userReviewsArr = reviewsData.reviews;
            }
          }
        }
        setUserReviews(userReviewsArr);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditUser({ username: user.username || '', email: user.email || '' });
    }
  }, [user]);

  // Toggle expand/collapse for an order
  const handleToggleOrder = async (orderId) => {
    if (expandedOrders.includes(orderId)) {
      setExpandedOrders(expandedOrders.filter(id => id !== orderId));
    } else {
      setExpandedOrders([...expandedOrders, orderId]);
      // Fetch order items if not already fetched
      if (!orderItems[orderId]) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/users/orders/${orderId}/items`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          if (res.ok) {
            const data = await res.json();
            setOrderItems(prev => ({ ...prev, [orderId]: data.items || [] }));
          } else {
            setOrderItems(prev => ({ ...prev, [orderId]: [] }));
          }
        } catch {
          setOrderItems(prev => ({ ...prev, [orderId]: [] }));
        }
      }
    }
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdateStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUser)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowEdit(false);
        setUpdateStatus('User info updated successfully!');
      } else {
        const err = await res.json();
        setUpdateStatus(err.error || 'Update failed');
      }
    } catch {
      setUpdateStatus('Update failed');
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="admin-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="admin-overview">
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Welcome</h3>
                  <p>{user ? user.username : 'User'}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Liked Items</h3>
                  <p>{stats.totalLikes}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Cart Items</h3>
                  <p>{stats.totalCartItems}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Order Items</h3>
                  <p>{stats.totalOrders}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Review Count</h3>
                  <p>{stats.totalReviews}</p>
                </div>
              </div>
              
              <div className="recent-activity">
                <h2>Recent Activity</h2>
                {userReviews.length === 0 ? (
                  <p>No reviews found.</p>
                ) : (
                  <table className="recent-reviews-table" style={{width: '100%', borderCollapse: 'collapse', marginTop: 12}}>
                    <thead>
                      <tr>
                        <th style={{textAlign: 'left', padding: 8}}>Product</th>
                        <th style={{textAlign: 'left', padding: 8}}>Review</th>
                        <th style={{textAlign: 'left', padding: 8}}>Rating</th>
                        <th style={{textAlign: 'left', padding: 8}}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReviews.map(r => (
                        <tr key={r.id} style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: 8}}>{r.product_name || r.productId || 'N/A'}</td>
                          <td style={{padding: 8}}>{r.comment}</td>
                          <td style={{padding: 8}}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} ({r.rating}/5)</td>
                          <td style={{padding: 8}}>{new Date(r.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-section">
              <h2>Favorited Items</h2>
              {likedProducts.length === 0 ? (
                <p>No liked products found.</p>
              ) : (
                <div className="favorites-grid">
                  {likedProducts.map(item => (
                    <div key={item.id} className="favorite-item">
                      <img 
                        src={Array.isArray(item.images) && item.images.length > 0
                          ? (item.images[0].image_url && item.images[0].image_url.startsWith('/uploads')
                              ? API_BASE_URL.replace(/\/api$/, '') + item.images[0].image_url
                              : item.images[0].image_url)
                          : (item.image_url && item.image_url.startsWith('/uploads')
                              ? API_BASE_URL.replace(/\/api$/, '') + item.image_url
                              : item.image_url || '/images/default-product.jpg')}
                        alt={item.name}
                        onError={e => { e.target.src = '/images/default-product.jpg'; }}
                      />
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <p><b>Price:</b> ${Number(item.price).toFixed(2)}</p>
                      <a
                        href={`/designs/abstract/${item.collection_id}?product=${item.id}`}
                        className="details-link view-details-btn"
                        style={{ color: '#fff', background: 'linear-gradient(90deg,#d4af37,#bfa14a)', borderRadius: 6, padding: '0.5rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, textDecoration: 'none', marginTop: 8 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>View Details</span>
                        <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Your Orders</h2>
              {userOrders.length === 0 ? (
                <p>No orders found.</p>
              ) : (
                <table className="orders-table enhanced-orders-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map(order => (
                      <>
                        <tr key={order.id} className="order-row">
                          <td>
                            <button
                              className="expand-btn"
                              onClick={() => handleToggleOrder(order.id)}
                              aria-label={expandedOrders.includes(order.id) ? 'Collapse' : 'Expand'}
                            >
                              {expandedOrders.includes(order.id) ? '−' : '+'}
                            </button>
                          </td>
                          <td>{order.id}</td>
                          <td>{order.placed_at ? new Date(order.placed_at).toLocaleString() : ''}</td>
                          <td>{order.status}</td>
                          <td>${Number(order.total_amount).toFixed(2)}</td>
                        </tr>
                        {expandedOrders.includes(order.id) && (
                          <tr className="order-details-row">
                            <td colSpan={5}>
                              <div className="order-details-box">
                                <h4>Order Details</h4>
                                <div><b>Order ID:</b> {order.id}</div>
                                <div><b>Date:</b> {order.placed_at ? new Date(order.placed_at).toLocaleString() : ''}</div>
                                <div><b>Status:</b> {order.status}</div>
                                <div><b>Total:</b> ${Number(order.total_amount).toFixed(2)}</div>
                                <div><b>Recipient Name:</b> {order.recipient_name || 'N/A'}</div>
                                <div><b>Phone:</b> {order.phone || 'N/A'}</div>
                                <div><b>Email:</b> {order.email || 'N/A'}</div>
                                <div><b>Shipping Address:</b> {order.shipping_address || 'N/A'}</div>
                                <div><b>Payment Method:</b> {order.payment_method || 'N/A'}</div>
                                <div><b>Notes:</b> {order.notes || 'N/A'}</div>
                                <div style={{marginTop: '1rem'}}><b>Order Items:</b></div>
                                {orderItems[order.id] ? (
                                  orderItems[order.id].length === 0 ? (
                                    <div>No items found for this order.</div>
                                  ) : (
                                    <ul className="order-items-list">
                                      {orderItems[order.id].map(item => (
                                        <li key={item.id} className="order-item" style={{marginBottom: '1.2rem'}}>
                                          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                            {item.image_url && (
                                              <img src={item.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + item.image_url : item.image_url} alt={item.product_name} style={{width: 150, height: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid #333'}} onError={e => { e.target.src = '/images/default-product.jpg'; }} />
                                            )}
                                            <div>
                                              <div><b>Product:</b> {item.product_name} (ID: {item.product_id})</div>
                                              <div><b>Description:</b> {item.product_description || 'N/A'}</div>
                                              <div><b>Collection:</b> {item.collection_id || 'N/A'}</div>
                                              <div><b>Quantity:</b> {item.quantity}</div>
                                              <div><b>Price (each):</b> ${Number(item.price).toFixed(2)}</div>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )
                                ) : (
                                  <div>Loading items...</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              {user ? (
                <div className="settings-box">
                  {!showEdit ? (
                    <>
                      <div><b>Username:</b> {user.username}</div>
                      <div><b>Email:</b> {user.email}</div>
                      <div><b>Role:</b> {user.role}</div>
                      <div><b>Created At:</b> {user.created_at ? new Date(user.created_at).toLocaleString() : ''}</div>
                      <button className="expand-btn" style={{marginTop: '1.5rem'}} onClick={() => setShowEdit(true)}>Edit Info</button>
                    </>
                  ) : (
                    <form onSubmit={handleUpdateUser} className="settings-form">
                      <div>
                        <label>Username:</label>
                        <input type="text" name="username" value={editUser.username} onChange={handleEditChange} required />
                      </div>
                      <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={editUser.email} onChange={handleEditChange} required />
                      </div>
                      <div style={{marginTop: '1rem'}}>
                        <button type="submit" className="expand-btn">Save</button>
                        <button type="button" className="expand-btn" style={{marginLeft: '1rem'}} onClick={() => { setShowEdit(false); setEditUser({ username: user.username, email: user.email }); setUpdateStatus(''); }}>Cancel</button>
                      </div>
                      {updateStatus && <div style={{marginTop: '1rem', color: updateStatus.includes('success') ? '#4caf50' : '#e53935'}}>{updateStatus}</div>}
                    </form>
                  )}
                </div>
              ) : (
                <div>Loading user info...</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;