import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../../../config';
import './abstract.css';
import ProductDetails from './ProductDetails';
import PublicProductDetails from './ProductDetails';

const QuickViewModal = ({ product, onClose, onViewDetails }) => {
  if (!product) return null;
  return (
    <div className="quickview-modal-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={e => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose}>&times;</button>
        <div className="quickview-content">
          <div className="quickview-image-section">
            {Array.isArray(product.images) && product.images.length > 0 ? (
              <img src={product.images[0].image_url && product.images[0].image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + product.images[0].image_url : product.images[0].image_url} alt={product.name} style={{ width: 260, height: 260, objectFit: 'cover', borderRadius: 12, background: '#fff', border: '1px solid #f0e6c5' }} />
            ) : (
              <div style={{ width: 260, height: 260, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 28, borderRadius: 12 }}>No Image</div>
            )}
          </div>
          <div className="quickview-info-section">
            <h2 style={{ color: '#bfa14a', fontWeight: 700, fontSize: 24, margin: 0 }}>{product.name}</h2>
            <div style={{ fontSize: 18, color: '#bfa14a', margin: '10px 0' }}>₦{product.price}</div>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Stock: {product.stock}</div>
            {product.tags && product.tags.length > 0 && (
              <div className="admin-card-tags" style={{ margin: '10px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.tags.split(',').map((tag, i) => (
                  <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                ))}
              </div>
            )}
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button className="quickview-details-btn" onClick={() => onViewDetails(product.id)}>View Details</button>
            </div>
          </div>
        </div>
        <style>{`
          .quickview-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.25); z-index: 1000; display: flex; align-items: center; justify-content: center;
          }
          .quickview-modal {
            background: #fffbe6; border-radius: 18px; box-shadow: 0 4px 32px rgba(191,161,74,0.13);
            padding: 32px 32px 24px 32px; min-width: 420px; max-width: 90vw; position: relative;
          }
          .quickview-close {
            position: absolute; top: 12px; right: 18px; background: none; border: none; font-size: 2rem; color: #bfa14a; cursor: pointer;
          }
          .quickview-content { display: flex; gap: 32px; align-items: flex-start; }
          .quickview-image-section { flex-shrink: 0; }
          .quickview-info-section { flex: 1; }
          .quickview-details-btn {
            background: #bfa14a; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;
          }
          .quickview-details-btn:hover { background: #a88d3a; }
        `}</style>
      </div>
    </div>
  );
};

const Abstract = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        fetch(`${API_BASE_URL}/admin/collections`).then(res => res.json()),
        fetch(`${API_BASE_URL}/admin/collections/${id}/products`).then(res => res.json())
      ]).then(([colData, prodData]) => {
        if (colData.collections) {
          const found = colData.collections.find(c => String(c.id) === String(id));
          setCollection(found || null);
        } else {
          setCollection(null);
        }
        if (prodData.products) {
          setProducts(prodData.products);
        } else {
          setProducts([]);
        }
        setLoading(false);
      }).catch(() => {
        setError("Failed to load collection or products");
        setLoading(false);
      });
    }
    window.scrollTo(0, 0);
  }, [id]);

  const handleQuickView = (product) => setQuickViewProduct(product);
  const handleCloseQuickView = () => setQuickViewProduct(null);
  const handleViewDetails = (productId) => {
    setQuickViewProduct(null);
    setSelectedProductId(productId);
    setShowProductDetails(true);
  };
  const handleCloseProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProductId(null);
  };

  return (
    <div className="abstract-container" style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>Loading collection...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', margin: '2rem 0' }}>{error}</div>
      ) : !collection ? (
        <div style={{ color: 'red', textAlign: 'center', margin: '2rem 0' }}>
          Collection not found for id: {id}
        </div>
      ) : (
        <>
          {/* Sidebar with collection details - larger and more aligned */}
          <aside style={{ minWidth: 320, maxWidth: 400, background: '#fffbe6', border: '1.5px solid #f0e6c5', borderRadius: 16, padding: 32, height: 'fit-content', position: 'sticky', top: 32, boxShadow: '0 2px 16px rgba(191,161,74,0.07)' }}>
            {collection.image_url ? (
              <img src={collection.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + collection.image_url : collection.image_url} alt={collection.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 18, background: '#fff', border: '1px solid #f0e6c5' }} />
            ) : (
              <div style={{ width: '100%', height: 200, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 28, borderRadius: 10, marginBottom: 18 }}>No Image</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{ color: '#bfa14a', fontWeight: 700, fontSize: 26, margin: 0 }}>{collection.name}</h2>
              {collection.featured && <div className="premium-badge" style={{ fontSize: 18, marginLeft: 6 }}>★ Featured</div>}
            </div>
            <div style={{ color: '#888', margin: '8px 0 12px 0', fontSize: 16 }}>{collection.description}</div>
            {collection.tags && collection.tags.length > 0 && (
              <div className="admin-card-tags" style={{ margin: '10px 0 0 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {collection.tags.split(',').map((tag, i) => (
                  <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                ))}
              </div>
            )}
            <div style={{ marginTop: 18, color: '#bfa14a', fontWeight: 600, fontSize: 16 }}>{products.length} Products</div>
            <Link to="/designs" className="back-link" style={{ display: 'block', marginTop: 18, color: '#bfa14a', textDecoration: 'underline', fontWeight: 500 }}>
              ← Back to all designs
            </Link>
          </aside>
          {/* Products grid */}
          <main style={{ flex: 1 }}>
            <div 
              className="designs-grid"
              style={{ marginTop: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 24 }}
            >
              {products.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No products in this collection.</div>
              ) : (
                products.map(product => (
                  <div
                    key={product.id}
                    className="design-card"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', minHeight: 220, cursor: 'pointer', position: 'relative' }}
                  >
                    <div className="image-container" style={{ position: 'relative' }}>
                      {Array.isArray(product.images) && product.images.length > 0 ? (
                        <img src={product.images[0].image_url && product.images[0].image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + product.images[0].image_url : product.images[0].image_url} alt={product.name} className="card-image" style={{ height: 280, objectFit: 'cover', borderRadius: 8, background: '#fff' }} />
                      ) : (
                        <div className="card-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24, height: 280, borderRadius: 8 }}>No Image</div>
                      )}
                      <div className="image-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8, background: 'rgba(191,161,74,0.08)', opacity: 0, transition: 'opacity 0.2s' }}></div>
                      <div className="quick-view" style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: '#fffbe6', color: '#bfa14a', border: '1.5px solid #bfa14a', borderRadius: 8, padding: '7px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                        onClick={() => handleQuickView(product)}
                        onMouseDown={e => e.stopPropagation()}
                      >QUICK VIEW</div>
                    </div>
                    <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }} onClick={() => handleViewDetails(product.id)}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{product.name}</h3>
                      <div className="card-meta" style={{ fontSize: 15, color: '#bfa14a', display: 'flex', gap: 12 }}>
                        <span className="price">₦{product.price}</span>
                        <span className="rating">Stock: {product.stock}</span>
                      </div>
                      {product.tags && product.tags.length > 0 && (
                        <div className="admin-card-tags" style={{ marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                          {product.tags.split(',').map((tag, i) => (
                            <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <style>{`
                      .design-card:hover .image-overlay { opacity: 1; }
                      .design-card:hover .quick-view { opacity: 1; }
                    `}</style>
                  </div>
                ))
              )}
            </div>
          </main>
          {quickViewProduct && (
            <QuickViewModal
              product={quickViewProduct}
              onClose={handleCloseQuickView}
              onViewDetails={handleViewDetails}
            />
          )}
          {showProductDetails && selectedProductId && (
            <div className="product-details-modal-overlay" onClick={handleCloseProductDetails}>
              <div className="product-details-modal" onClick={e => e.stopPropagation()}>
                <button className="quickview-close" onClick={handleCloseProductDetails}>&times;</button>
                <PublicProductDetails productId={selectedProductId} />
              </div>
              <style>{`
                .product-details-modal-overlay {
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.25); z-index: 1100; display: flex; align-items: flex-start; justify-content: center;
                  overflow: auto;
                  /* Ensure overlay starts at the very top and content is not cut off */
                  padding-top: 0;
                  box-sizing: border-box;
                }
                .product-details-modal {
                  background: #fffbe6; border-radius: 18px; box-shadow: 0 4px 32px rgba(191,161,74,0.13);
                  padding: 32px 32px 24px 32px; min-width: 520px; max-width: 95vw; position: relative;
                  margin-top: 40px;
                }
                .quickview-close {
                  position: absolute; top: 12px; right: 18px; background: none; border: none; font-size: 2rem; color: #bfa14a; cursor: pointer;
                }
              `}</style>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Abstract;