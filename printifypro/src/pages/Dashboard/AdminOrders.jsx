import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../config';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/orders`, {
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
          }
        });
        const data = await res.json();
        if (res.ok) setOrders(data.orders);
        else setError(data.error || "Failed to load orders");
      } catch {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">Order Management</h3>
      <div className="admin-section-desc">View and manage customer orders.</div>
      <div className="admin-table-wrapper">
        {loading ? <div>Loading...</div> : error ? <div className="settings-error">{error}</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name || order.username || order.customer || 'N/A'}</td>
                  <td>{order.placed_at ? new Date(order.placed_at).toLocaleDateString() : ''}</td>
                  <td><span className={`status-${order.status?.toLowerCase()}`}>{order.status}</span></td>
                  <td>${Number(order.total_amount)?.toFixed(2) ?? '0.00'}</td>
                  <td>
                    <button className="admin-action-btn" onClick={() => navigate(`/admin-dashboard/orders/${order.id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
