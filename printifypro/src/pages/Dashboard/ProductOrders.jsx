import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaUserCircle, FaClipboardList } from "react-icons/fa";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';

const statusColors = {
  completed: "#388e3c",
  pending: "#bfa14a",
  cancelled: "#d9534f",
  processing: "#007bff"
};

const ProductOrders = () => {
  const { productId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/orders`);
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
  }, [productId]);

  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedOrders = orders.slice(startIdx, endIdx);

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">Orders for Product #{productId}</h3>
      <div className="admin-section-desc">All orders containing this product.</div>
      {loading ? <div>Loading...</div> : error ? <div className="settings-error">{error}</div> : (
        <>
          <div className="admin-list-grid">
            {paginatedOrders.map((o) => (
              <div className="admin-list-card" key={o.id}>
                <div className="admin-list-avatar"><FaUserCircle /></div>
                <div className="admin-list-info">
                  <div className="admin-list-name">{o.username}</div>
                  <div className="admin-list-order">Order #{o.order_id} &middot; {o.quantity}x</div>
                  <div className="admin-list-date">{new Date(o.placed_at).toLocaleDateString()}</div>
                </div>
                <div className="admin-list-action">
                  <FaClipboardList />
                  <span className="admin-status-badge" style={{background: statusColors[o.status]}}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-bar">
            <span>
              Showing {totalItems === 0 ? 0 : startIdx + 1}-{Math.min(endIdx, totalItems)} of {totalItems}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductOrders;
