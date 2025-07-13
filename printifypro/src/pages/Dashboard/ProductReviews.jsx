import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaUserCircle, FaStar } from "react-icons/fa";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';

const ProductReviews = () => {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/reviews`);
        const data = await res.json();
        if (res.ok) setReviews(data.reviews);
        else setError(data.error || "Failed to load reviews");
      } catch {
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const totalItems = reviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedReviews = reviews.slice(startIdx, endIdx);

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">Reviews for Product #{productId}</h3>
      <div className="admin-section-desc">All reviews for this product.</div>
      {loading ? <div>Loading...</div> : error ? <div className="settings-error">{error}</div> : (
        <>
          <div className="admin-list-grid">
            {paginatedReviews.map((r) => (
              <div className="admin-list-card" key={r.id}>
                <div className="admin-list-avatar"><FaUserCircle /></div>
                <div className="admin-list-info">
                  <div className="admin-list-name">{r.username}</div>
                  <div className="admin-list-rating">
                    {[...Array(r.rating)].map((_, i) => <FaStar key={i} color="#bfa14a" />)}
                    <span className="admin-list-date">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="admin-list-comment">{r.comment}</div>
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

export default ProductReviews;
