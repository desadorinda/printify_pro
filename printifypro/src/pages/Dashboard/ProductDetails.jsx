import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${productId}`);
      const data = await res.json();
      if (res.ok) setProduct(data.product);
      else setError(data.error || "Failed to load product");
    } catch {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-section-content">Loading product...</div>;
  if (error) return <div className="admin-section-content settings-error">{error}</div>;
  if (!product) return <div className="admin-section-content">Product not found.</div>;

  return (
    <div className="admin-section-content">
      <h3 className="admin-section-title">Product Details: {product.name}</h3>
      <div className="admin-section-desc">All details, images, and stats for this product.</div>
      <div className="admin-product-details"> 
        <div className="admin-product-carousel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {product.images && product.images.length > 0 ? product.images.map((img, idx) => {
            let imageSrc = img.image_url;
            let baseUrl = API_BASE_URL.replace(/\/api$/, '');
            if (imageSrc && imageSrc.startsWith('/uploads')) {
              imageSrc = `${baseUrl}${imageSrc}`;
            }
            return (
              <img
                src={imageSrc}
                alt={`Product ${idx+1}`}
                key={img.id}
                className="admin-product-img"
                style={{
                  width: product.images.length === 1 ? '60%' : product.images.length === 2 ? '48%' : product.images.length === 3 ? '32%' : '23%',
                  height: '280px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                onClick={() => setModalImg(imageSrc)}
              />
            );
          }) : <span className="muted">No images</span>}
        </div>
        {/* Modal for image preview */}
        {modalImg && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }} onClick={() => setModalImg(null)}>
            <img src={modalImg} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }} />
          </div>
        )}
        <div className="admin-product-info">
          <div><strong>Name:</strong> {product.name}</div>
          <div><strong>Description:</strong> {product.description}</div>
          <div><strong>Price:</strong> ₦{product.price}</div>
          <div><strong>Stock:</strong> {product.stock}</div>
          {/* Product tags display */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ margin: '0.5rem 0 0.7rem 0' }}>
              <strong>Tags:</strong>
              <div className="admin-card-tags" style={{ marginTop: 4 }}>
                {product.tags.split(',').map((tag, i) => (
                  <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="admin-product-stats">
          <Link to={`/admin-dashboard/products/${productId}/likes`} className="admin-product-stat">
            <FaHeart /> <span>{product.likes} Likes</span>
          </Link>
          <Link to={`/admin-dashboard/products/${productId}/reviews`} className="admin-product-stat">
            <FaStar /> <span>{product.reviews} Reviews</span>
          </Link>
          <Link to={`/admin-dashboard/products/${productId}/orders`} className="admin-product-stat">
            <FaShoppingCart /> <span>{product.orders} Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
