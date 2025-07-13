import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from '../../config';

const statusOptions = [
  'pending',
  'processing',
  'completed',
  'cancelled'
];

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
          }
        });
        const data = await res.json();
        if (res.ok) {
          setOrder(data.order);
          setStatus(data.order.status);
        } else setError(data.error || "Failed to load order");
      } catch {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setOrder(o => ({ ...o, status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-section-content">Loading...</div>;
  if (error) return <div className="admin-section-content settings-error">{error}</div>;
  if (!order) return <div className="admin-section-content">Order not found.</div>;

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">Order Details</h3>
      <div className="admin-section-desc">Detailed view of order <span style={{color:'#bfa14a', fontWeight:700}}>#{order.id}</span></div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'2.5rem',width:'100%',marginBottom:'2rem'}}>
        <div style={{minWidth:260,maxWidth:400}}>
          <div style={{marginBottom:12}}><b>Customer:</b> <span style={{color:'#bfa14a'}}>{order.recipient_name || order.username || order.customer || 'N/A'}</span></div>
          <div style={{marginBottom:12}}><b>Email:</b> <span style={{color:'#888'}}>{order.email}</span></div>
          <div style={{marginBottom:12}}><b>Phone:</b> <span style={{color:'#888'}}>{order.phone}</span></div>
          <div style={{marginBottom:12}}><b>Date:</b> <span style={{color:'#888'}}>{order.placed_at ? new Date(order.placed_at).toLocaleString() : ''}</span></div>
          <div style={{marginBottom:12}}><b>Status:</b> {" "}
            <select value={status} onChange={e => setStatus(e.target.value)} disabled={saving} style={{marginLeft:4,padding:'0.3rem 0.7rem',borderRadius:5,border:'1px solid #bfa14a',color:'#bfa14a',fontWeight:600}}>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
            <button className="admin-action-btn" onClick={handleStatusChange} disabled={saving || status === order.status} style={{marginLeft:8}}>
              {saving ? 'Saving...' : 'Change Status'}
            </button>
          </div>
          <div style={{marginBottom:12}}><b>Payment Method:</b> <span style={{color:'#888'}}>{order.payment_method}</span></div>
          <div style={{marginBottom:12}}><b>Shipping Address:</b> <span style={{color:'#888'}}>{order.shipping_address}</span></div>
          <div style={{marginBottom:12}}><b>Notes:</b> <span style={{color:'#888'}}>{order.notes}</span></div>
          <div style={{marginBottom:12}}><b>Total:</b> <span style={{color:'#388e3c',fontWeight:700}}>${Number(order.total_amount)?.toFixed(2) ?? '0.00'}</span></div>
        </div>
        <div style={{flex:1,minWidth:320}}>
          <h4 style={{marginTop:0,marginBottom:12,color:'#bfa14a',fontWeight:700}}>Order Items</h4>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.price)?.toFixed(2)}</td>
                    <td>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                  </tr>
                )) : <tr><td colSpan={5}>No items</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
