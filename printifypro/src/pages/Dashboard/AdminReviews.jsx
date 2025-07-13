import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '../../config';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reviews`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch {
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">All Product Reviews</h3>
      <div className="admin-section-desc">View all product reviews in the system.</div>
      {loading ? <div>Loading reviews...</div> : error ? <div className="settings-error">{error}</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center'}}>No reviews found.</td></tr>
              ) : reviews.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.username}</td>
                  <td>{r.product_name}</td>
                  <td>{r.rating}</td>
                  <td>{r.comment}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
