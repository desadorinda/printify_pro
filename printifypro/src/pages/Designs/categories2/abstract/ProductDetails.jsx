import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { API_BASE_URL } from "../../../../config";
import * as api from '../../../../api';
import { useCart } from '../../../../Context/CartContext';
import "./ProductDetails.css";

// Get user from localStorage (move this above all hooks)
const getUserFromStorage = () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

const PublicProductDetails = (props) => {
  // Use productId from props if provided, else from useParams
  const params = useParams();
  const productId = props.productId || params.productId;

  const [user, setUser] = useState(getUserFromStorage());
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [carted, setCarted] = useState(false);
  const [review, setReview] = useState("");
  const [modalImg, setModalImg] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [likeError, setLikeError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart: addToCartContext, refreshCart } = useCart();

  useEffect(() => {
    fetchProduct();
    fetchLikes();
    fetchCarted();
    fetchReviews();
    // eslint-disable-next-line
  }, [productId, user]);

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

  const fetchLikes = async () => {
    // Always fetch like count, even if not logged in
    try {
      const res = user && user.token ? await api.getProductLikes(productId, user.token) : await api.getProductLikes(productId);
      setLikeCount(res.data.likes.length);
      setLiked(res.data.userLiked || false);
    } catch {
      // fallback: show like count from product if available
      setLikeCount(product?.likes || 0);
      setLiked(false);
    }
  };

  const fetchCarted = async () => {
    if (!user || !user.token) {
      setCarted(false);
      return;
    }
    try {
      const res = await api.getUserCart(user.token);
      setCarted(res.data.cartItems.some(item => item.product_id === Number(productId)));
    } catch {
      setCarted(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.getProductReviews(productId);
      setReviews(res.data.reviews || []);
    } catch {
      setReviews([]);
    }
  };

  // Keep user state in sync with localStorage (handles login/logout in other tabs)
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  // If not logged in, prompt for login/signup before like/cart/review
  const requireAuth = (action) => {
    if (!user) {
      if (window.confirm("You need to sign up or log in to " + action + ". Proceed to login?")) {
        navigate('/login');
      }
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!user) {
      if (window.confirm("You need to sign up or log in to like this product. Proceed to login?")) {
        navigate('/login');
      }
      return;
    }
    setLikeError("");
    setLikeLoading(true);
    try {
      if (!liked) {
        await api.likeProduct(productId, user.token);
      } else {
        await api.unlikeProduct(productId, user.token);
      }
      await fetchLikes();
    } catch (err) {
      // If already liked/unliked, just refresh state
      await fetchLikes();
      let msg = 'Failed to ' + (liked ? 'unlike' : 'like') + ' product.';
      if (err && err.response && err.response.data && err.response.data.error) {
        msg += ' ' + err.response.data.error;
      }
      setLikeError(msg);
      console.error('Like error:', err);
    } finally {
      setLikeLoading(false);
    }
  };
  const handleAddToCart = async () => {
    if (!requireAuth('add to cart')) return;
    try {
      await api.addToCart(productId, user.token, cartQuantity);
      setCarted(true); // Optimistically update UI immediately
      // Add to global cart context for instant navbar/cart updates
      if (product) {
        addToCartContext({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: cartQuantity,
          image: product.images?.[0]?.image_url || '',
        });
      }
      // Refresh cart context from backend for logged-in user
      if (user && user.token && refreshCart) {
        await refreshCart(user.token);
      }
      await fetchCarted(); // Optionally still refresh from backend for accuracy
    } catch {
      alert('Failed to add to cart.');
    }
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuth('review')) return;
    setReviewLoading(true);
    try {
      await api.addReview(productId, reviewRating, review, user.token);
      setReview("");
      setReviewRating(5);
      await fetchReviews();
      alert("Review submitted!");
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Carousel navigation
  const handlePrev = () => {
    if (!product?.images?.length) return;
    setCarouselIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };
  const handleNext = () => {
    if (!product?.images?.length) return;
    setCarouselIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // Calculate average rating and review count
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount) : 0;

  // Helper to render stars
  const renderStars = (rating, size = 18) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          style={{ color: i <= rating ? '#bfa14a' : '#e0d6b8', fontSize: size, marginRight: 2 }}
          data-testid={i <= rating ? 'filled-star' : 'empty-star'}
        />
      );
    }
    return stars;
  };

  if (loading)
    return <div className="product-details-content">Loading product...</div>;
  if (error)
    return <div className="product-details-content error">{error}</div>;
  if (!product)
    return <div className="product-details-content">Product not found.</div>;

  return (
    <div className="product-details-content">
      <div
        className="product-details-main"
        style={{
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          className="product-details-carousel"
          style={{
            position: "relative",
            width: 380,
            minHeight: 400,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(191,161,74,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={(() => {
                  let imageSrc = product.images[carouselIndex].image_url;
                  let baseUrl = API_BASE_URL.replace(/\/api$/, "");
                  if (imageSrc && imageSrc.startsWith("/uploads")) {
                    imageSrc = `${baseUrl}${imageSrc}`;
                  }
                  return imageSrc;
                })()}
                alt={`Product ${carouselIndex + 1}`}
                className="product-details-img"
                style={{
                  width: 350,
                  height: 350,
                  objectFit: "cover",
                  borderRadius: 14,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
                onClick={() => {
                  let imageSrc = product.images[carouselIndex].image_url;
                  let baseUrl = API_BASE_URL.replace(/\/api$/, "");
                  if (imageSrc && imageSrc.startsWith("/uploads")) {
                    imageSrc = `${baseUrl}${imageSrc}`;
                  }
                  setModalImg(imageSrc);
                }}
              />
              {product.images.length > 1 && (
                <>
                  <button className="carousel-btn left" onClick={handlePrev}>
                    &lt;
                  </button>
                  <button className="carousel-btn right" onClick={handleNext}>
                    &gt;
                  </button>
                  <div className="carousel-dots">
                    {product.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={idx === carouselIndex ? "active" : ""}
                        onClick={() => setCarouselIndex(idx)}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span className="muted">No images</span>
          )}
          {modalImg && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onClick={() => setModalImg(null)}
            >
              <img
                src={modalImg}
                alt="Preview"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  borderRadius: "10px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          )}
        </div>
        <div
          className="product-details-info"
          style={{
            flex: 1,
            minWidth: 260,
            maxWidth: 420,
            background: "#fffbe6",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 2px 16px rgba(191,161,74,0.07)",
          }}
        >
          <h2
            style={{
              color: "#bfa14a",
              fontWeight: 800,
              fontSize: 32,
              marginBottom: 8,
            }}
          >
            {product.name}
          </h2>
          <div
            style={{
              fontSize: 26,
              color: "#bfa14a",
              fontWeight: 700,
              margin: "10px 0 8px 0",
            }}
          >
            ₦{product.price}
          </div>
          <div style={{ color: "#888", fontSize: 17, marginBottom: 12 }}>
            Stock:{" "}
            <span
              style={{
                color: product.stock > 0 ? "#4caf50" : "#e53935",
                fontWeight: 600,
              }}
            >
              {product.stock > 0 ? product.stock : "Out of stock"}
            </span>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div
              className="admin-card-tags"
              style={{
                margin: "10px 0",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {product.tags.split(",").map((tag, i) => (
                <span className="admin-card-tag" key={i}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              margin: "18px 0",
              color: "#444",
              fontSize: 17,
              lineHeight: 1.6,
            }}
          >
            {product.description}
          </div>
          <div style={{ display: "flex", gap: 18, margin: "18px 0" }}>
            <button
              className={`like-btn${liked ? " liked" : ""}`}
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: liked ? '#bfa14a' : '#fff',
                color: liked ? '#fff' : '#bfa14a',
                border: '1.5px solid #bfa14a',
                borderRadius: 8,
                padding: '8px 16px',
                fontWeight: 600,
                cursor: likeLoading ? 'not-allowed' : 'pointer',
                boxShadow: liked ? '0 2px 8px rgba(191,161,74,0.12)' : 'none',
                transition: 'all 0.2s',
                opacity: likeLoading ? 0.7 : 1,
              }}
              aria-pressed={liked}
              title={liked ? 'Unlike' : 'Like'}
              disabled={likeLoading}
            >
              <FaHeart style={{ marginRight: 6, color: liked ? '#fff' : '#bfa14a', filter: liked ? 'drop-shadow(0 0 2px #bfa14a)' : 'none' }} />
              {liked ? "Liked" : "Like"} ({likeCount})
            </button>
            <input
              type="number"
              min={1}
              value={cartQuantity}
              onChange={e => setCartQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 60, marginRight: 8, borderRadius: 6, border: '1px solid #ccc', padding: 6 }}
              aria-label="Quantity"
            />
            <button
              className="cart-btn"
              onClick={handleAddToCart}
              disabled={carted}
            >
              <FaShoppingCart style={{ marginRight: 6 }} />{carted ? "Added" : "Add to Cart"}
            </button>
          </div>
          {likeError && (
            <div style={{ color: '#e53935', margin: '8px 0 0 0', fontSize: 15 }}>{likeError}</div>
          )}
        </div>
      </div>
      <div className="product-details-reviews" style={{ marginTop: 40, maxWidth: 600, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 16px rgba(191,161,74,0.07)" }}>
        <h3 style={{ color: "#bfa14a", fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center" }}>
          <FaStar style={{ marginRight: 8 }} />
          Reviews
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {renderStars(Math.round(avgRating), 22)}
          <span style={{ color: '#bfa14a', fontWeight: 700, fontSize: 18, marginLeft: 6 }}>{avgRating.toFixed(1)} star</span>
          <span style={{ color: '#888', fontSize: 15, marginLeft: 10 }}>({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
        </div>
        {user ? (
          <form onSubmit={handleReviewSubmit} style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: 'center' }}>
            <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }} required>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
            </select>
            <input type="text" value={review} onChange={e => setReview(e.target.value)} placeholder="Write a review..." style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} required />
            <button type="submit" style={{ background: "#bfa14a", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: reviewLoading ? 'not-allowed' : 'pointer', opacity: reviewLoading ? 0.7 : 1 }} disabled={reviewLoading}>Submit</button>
          </form>
        ) : (
          <div style={{ color: '#888', marginBottom: 12 }}>Log in to leave a review.</div>
        )}
        <div>
          {reviews.length === 0 ? (
            <div style={{ color: "#888", fontSize: 15 }}>No reviews yet.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {reviews.map(r => (
                <li key={r.id} style={{ marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: '#bfa14a', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0
                  }} aria-label={`Avatar for ${r.username}`}>
                    {r.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#bfa14a', fontSize: 16, marginBottom: 2 }}>{r.username}</div>
                    <div style={{ marginBottom: 6, color: '#444', fontSize: 16 }}>{r.comment}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      {renderStars(r.rating)}
                      <span style={{ fontWeight: 600 }}>{r.rating} / 5</span>
                    </div>
                    <div style={{ color: '#bbb', fontSize: 12, textAlign: 'right' }}>{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Link
        to="/designs"
        style={{
          display: "inline-block",
          marginTop: 32,
          color: "#bfa14a",
          textDecoration: "underline",
          fontWeight: 500,
        }}
      >
        ← Back to all designs
      </Link>
      <style>{`
        .product-details-carousel { position: relative; }
        .carousel-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: #fffbe6; color: #bfa14a; border: 1.5px solid #bfa14a;
          border-radius: 50%; width: 38px; height: 38px; font-size: 1.5rem; font-weight: 700;
          cursor: pointer; z-index: 2; transition: background 0.2s;
        }
        .carousel-btn.left { left: 8px; }
        .carousel-btn.right { right: 8px; }
        .carousel-btn:hover { background: #bfa14a; color: #fff; }
        .carousel-dots {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 7px;
        }
        .carousel-dots span {
          display: block; width: 10px; height: 10px; border-radius: 50%; background: #e0d6b8; cursor: pointer;
        }
        .carousel-dots span.active { background: #bfa14a; }
      `}</style>
    </div>
  );
};

export default PublicProductDetails;
