import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { addDesignToCart } from '../../api';
import { useCart } from '../../Context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

const OutlineDesigns = () => {
  const { outlineId } = useParams();
  const [outline, setOutline] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const { refreshCart } = useCart();

  useEffect(() => {
    const fetchOutlineAndDesigns = async () => {
      setLoading(true);
      try {
        const outlineRes = await fetch(`${API_BASE_URL}/admin/outlines/${outlineId}`);
        const outlineData = await outlineRes.json();
        setOutline(outlineData.outline || null);
        const designsRes = await fetch(`${API_BASE_URL}/admin/outlines/${outlineId}/designs`);
        const designsData = await designsRes.json();
        setDesigns(designsData.designs || []);
      } catch {
        setOutline(null);
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOutlineAndDesigns();
  }, [outlineId]);

  const handleAddToCart = async (designId) => {
    setCartLoading(true);
    setCartMessage("");
    const token = localStorage.getItem('token');
    try {
      await addDesignToCart(designId, token, 1);
      setCartMessage("Added to cart!");
      if (refreshCart && token) await refreshCart(token);
    } catch (err) {
      setCartMessage(err?.response?.data?.error || "Failed to add to cart");
    } finally {
      setCartLoading(false);
      setTimeout(() => setCartMessage(""), 2000);
    }
  };

  if (loading) return <div>Loading designs...</div>;
  if (!outline) return <div>Outline not found.</div>;

  return (
    <div className="admin-section-content">
      <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: 28, margin: '0 0 2rem 0' }}>{outline.name} - Designs</h2>
      {designs.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No designs in this outline.</div>
      ) : (
        <div className="admin-card-grid">
          {designs.map((design, index) => (
            <div key={design.id || design._id} className="admin-card fancy" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="admin-card-link" style={{ cursor: 'default' }}>
                {design.image_url && (
                  <img
                    src={design.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + design.image_url : design.image_url}
                    alt={design.name}
                    className="admin-card-collection-img"
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12, background: '#fff' }}
                  />
                )}
                <div className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{design.name}</div>
                <div className="admin-card-desc">{design.description || <span className="muted">No description</span>}</div>
                <div className="admin-card-meta">
                  <span className="admin-card-date">Created: {design.created_at ? new Date(design.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                </div>
                <button
                  className="admin-action-btn add"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={() => handleAddToCart(design.id || design._id)}
                  disabled={cartLoading}
                >
                  <FaShoppingCart style={{ marginRight: 6 }} />
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                {cartMessage && <div style={{ color: cartMessage === 'Added to cart!' ? 'green' : 'red', marginTop: 6 }}>{cartMessage}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutlineDesigns;
