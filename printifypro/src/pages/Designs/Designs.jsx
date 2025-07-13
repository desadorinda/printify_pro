import React, { useState, useEffect } from 'react';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import './Designs.css';
import { API_BASE_URL } from '../../config';
import { useLocation } from 'react-router-dom';
import { addDesignToCart } from '../../api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Designs = () => {
  const [outlines, setOutlines] = useState([]);
  const [loadingOutlines, setLoadingOutlines] = useState(true);
  const [outlinesError, setOutlinesError] = useState("");
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', email: '', description: '', products: '', image: null });
  const [customLoading, setCustomLoading] = useState(false);
  const [customSuccess, setCustomSuccess] = useState(false);
  const [customError, setCustomError] = useState('');
  const [modalDesign, setModalDesign] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const query = useQuery();

  useEffect(() => {
    const fetchOutlines = async () => {
      setLoadingOutlines(true);
      setOutlinesError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/outlines`);
        const data = await res.json();
        if (res.ok && data.outlines) {
          setOutlines(data.outlines);
        } else {
          setOutlinesError(data.error || "Failed to load outlines");
        }
      } catch {
        setOutlinesError("Failed to load outlines");
      } finally {
        setLoadingOutlines(false);
      }
    };
    fetchOutlines();
  }, []);

  useEffect(() => {
    // Check for outlineId in query params for direct linking
    const outlineId = query.get('outlineId');
    if (outlineId && outlines.length > 0) {
      const found = outlines.find(o => String(o.id || o._id) === String(outlineId));
      if (found && (!selectedOutline || (selectedOutline.id || selectedOutline._id) !== (found.id || found._id))) {
        setSelectedOutline(found);
        fetchDesignsForOutline(found.id || found._id);
      }
    }
    // eslint-disable-next-line
  }, [outlines, query]);

  const fetchDesignsForOutline = async (outlineId) => {
    setLoadingDesigns(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/outlines/${outlineId}/designs`);
      const data = await res.json();
      if (res.ok && data.designs) {
        setDesigns(data.designs);
      } else {
        setDesigns([]);
      }
    } catch {
      setDesigns([]);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleSelectOutline = (outline) => {
    setSelectedOutline(outline);
    fetchDesignsForOutline(outline.id || outline._id);
  };

  // Filter featured designs (from all outlines' designs)
  const featuredDesigns = outlines
    .flatMap(o => (o.designs || []))
    .filter(d => d && d.featured);

  const handleCustomRequestSubmit = async (e) => {
    e.preventDefault();
    setCustomLoading(true);
    setCustomError('');
    setCustomSuccess(false);
    try {
      const formData = new FormData();
      formData.append('name', customForm.name);
      formData.append('email', customForm.email);
      formData.append('description', customForm.description);
      formData.append('products', customForm.products);
      if (customForm.image) formData.append('image', customForm.image);
      const res = await fetch(`${API_BASE_URL}/custom-design-requests`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setCustomSuccess(true);
        setCustomForm({ name: '', email: '', description: '', products: '', image: null });
      } else {
        const data = await res.json();
        setCustomError(data.error || 'Failed to send request');
      }
    } catch {
      setCustomError('Failed to send request');
    } finally {
      setCustomLoading(false);
    }
  };

  const handleAddToCart = async (designId) => {
    setCartMessage('');
    const token = localStorage.getItem('token');
    try {
      await addDesignToCart(designId, token, 1);
      setCartMessage('Added to cart!');
      // Optionally refresh cart here if you have a context
    } catch (err) {
      setCartMessage('Failed to add to cart');
    } finally {
      setTimeout(() => setCartMessage(''), 2000);
    }
  };

  const handleEditDesign = (design) => {
    // TODO: Open edit form/modal for this design
    alert('Edit design feature coming soon!');
  };

  const handleDeleteDesign = async (designId) => {
    if (window.confirm('Are you sure you want to delete this design?')) {
      // TODO: Call backend to delete design, then refresh designs list
      alert('Delete design feature coming soon!');
    }
  };

  return (
    <div className="designs-page">
      <div className="floating-elements">
        {[...Array(19)].map((_, i) => (
          <div
            key={i}
            className="floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 25}s`,
              animationDelay: `-${Math.random() * 20}s`,
              width: `${Math.random() * 100 + 80}px`,
              height: `${Math.random() * 100 + 160}px`
            }}
          />
        ))}
      </div>
      <header className="designs-header">
        <div className="header-overlay"></div>
        <div className="header-content">
          <h1>Design Gallery</h1>
          <p>Discover unique designs for every style and occasion</p>
        </div>
      </header>
      {/* Custom Request Section - moved up, removed extra space */}
      <section style={{maxWidth: 800, margin: '0 auto 2rem auto', zIndex: 2, position: 'relative'}}>
        <h2 style={{color: '#FFD700', fontWeight: 700, fontSize: 26, marginBottom: 24}}>Custom Request</h2>
        {!showCustomRequest ? (
          <button className="submit-button" onClick={() => setShowCustomRequest(true)} style={{marginBottom: 24}}>Request a Custom Design</button>
        ) : (
          <form className="custom-design-form" onSubmit={handleCustomRequestSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" value={customForm.name} onChange={e => setCustomForm(f => ({...f, name: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={customForm.email} onChange={e => setCustomForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={customForm.description} onChange={e => setCustomForm(f => ({...f, description: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>List of Products</label>
              <input type="text" value={customForm.products} onChange={e => setCustomForm(f => ({...f, products: e.target.value}))} required placeholder="e.g. T-shirt, Mug, Poster" />
            </div>
            <div className="form-group">
              <label>Reference Image (optional)</label>
              <input type="file" accept="image/*" onChange={e => setCustomForm(f => ({...f, image: e.target.files[0]}))} />
            </div>
            {customError && <div style={{color: 'red', marginBottom: 12}}>{customError}</div>}
            {customSuccess && <div style={{color: 'green', marginBottom: 12}}>Request sent successfully!</div>}
            <button className="submit-button" type="submit" disabled={customLoading}>{customLoading ? 'Sending...' : 'Send Request'}</button>
            <button type="button" className="submit-button" style={{marginLeft: 16, background: '#222', color: '#FFD700', border: '1px solid #FFD700'}} onClick={() => setShowCustomRequest(false)}>Cancel</button>
          </form>
        )}
      </section>
      <main className="designs-container">
        {!selectedOutline ? (
          loadingOutlines ? (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>Loading outlines...</div>
          ) : outlinesError ? (
            <div style={{ color: 'red', textAlign: 'center', margin: '2rem 0' }}>{outlinesError}</div>
          ) : (
            <div className="bubble-grid">
              {outlines.map((outline, idx) => (
                <div key={outline._id || outline.id || idx} className="bubble-card" style={{ minHeight: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="bubble-image-container">
                    {outline.image_url ? (
                      <img src={outline.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + outline.image_url : outline.image_url} alt={outline.name} className="bubble-image" />
                    ) : (
                      <div className="bubble-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>No Image</div>
                    )}
                  </div>
                  <div className="bubble-content">
                    <h3>{outline.name}</h3>
                    <p>{outline.description}</p>
                    {/* Removed naira and price from outline cards */}
                    <button className="bubble-view-button" style={{ background: '#FFD700', color: '#111', border: '1px solid #FFD700' }} onClick={() => handleSelectOutline(outline)}>
                      View Category
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: 28, margin: '0 0 2rem 0' }}>{selectedOutline.name} Designs</h2>
            {loadingDesigns ? (
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>Loading designs...</div>
            ) : (
              <div className="bubble-grid">
                {designs.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No designs in this category.</div>
                ) : (
                  designs.map((design, index) => (
                    <div
                      key={design._id || design.id}
                      className={`bubble-card`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="bubble-image-container">
                        {design.image_url ? (
                          <img
                            src={design.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + design.image_url : design.image_url}
                            alt={design.name}
                            className="bubble-image"
                          />
                        ) : (
                          <div className="bubble-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>No Image</div>
                        )}
                        <button className="bubble-favorite-button">
                          <FaHeart />
                        </button>
                      </div>
                      <div className="bubble-content">
                        <h3>{design.name}</h3>
                        <p>{design.description}</p>
                        {design.price && (
                          <div style={{ fontWeight: 700, color: '#FFD700', marginBottom: 8 }}>₦{design.price}</div>
                        )}
                        <button className="bubble-view-button" style={{ background: '#FFD700', color: '#111', border: '1px solid #FFD700', marginBottom: 8 }} onClick={() => setModalDesign(design)}>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Modal for design details */}
            {modalDesign && (
              <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-content" style={{ background: 'linear-gradient(135deg, #111 70%, #FFD700 100%)', borderRadius: 16, padding: 28, maxWidth: 370, width: '100%', position: 'relative', minHeight: 320, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
                  <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 28, color: '#FFD700', cursor: 'pointer' }} onClick={() => setModalDesign(null)}>&times;</button>
                  {modalDesign.image_url ? (
                    <img src={modalDesign.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + modalDesign.image_url : modalDesign.image_url} alt={modalDesign.name} style={{ width: '100%', borderRadius: 8, marginBottom: 16, maxHeight: 140, objectFit: 'cover', border: '2px solid #FFD700', background: '#fff' }} />
                  ) : (
                    <div style={{ background: '#222', color: '#FFD700', textAlign: 'center', borderRadius: 8, marginBottom: 16, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFD700' }}>No Image</div>
                  )}
                  <h2 style={{ fontWeight: 900, marginBottom: 10, fontSize: 24, color: '#FFD700', textShadow: '0 2px 8px #111' }}>{modalDesign.name || <span style={{ color: '#bbb' }}>No name</span>}</h2>
                  <p style={{ marginBottom: 12, color: '#fff', fontSize: 16 }}>{modalDesign.description || <span style={{ color: '#bbb' }}>No description</span>}</p>
                  {modalDesign.price ? (
                    <div style={{ fontWeight: 800, color: '#FFD700', marginBottom: 14, fontSize: 20, textShadow: '0 2px 8px #111' }}>₦{modalDesign.price}</div>
                  ) : (
                    <div style={{ color: '#bbb', marginBottom: 14 }}>No price</div>
                  )}
                  <button className="bubble-view-button" style={{ background: '#FFD700', color: '#111', border: '2px solid #FFD700', width: '100%', marginTop: 18, fontWeight: 700, fontSize: 18, borderRadius: 8 }} onClick={() => handleAddToCart(modalDesign.id || modalDesign._id)}>
                    <FaShoppingCart style={{ marginRight: 8 }} /> Add to Cart
                  </button>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="bubble-view-button" style={{ background: '#222', color: '#FFD700', border: '2px solid #FFD700', fontWeight: 700, fontSize: 16, borderRadius: 8, flex: 1 }} onClick={() => handleEditDesign(modalDesign)}>
                      Edit
                    </button>
                    <button className="bubble-view-button" style={{ background: 'red', color: '#fff', border: '2px solid #FFD700', fontWeight: 700, fontSize: 16, borderRadius: 8, flex: 1 }} onClick={() => handleDeleteDesign(modalDesign.id || modalDesign._id)}>
                      Delete
                    </button>
                  </div>
                  {cartMessage && <div style={{ color: cartMessage === 'Added to cart!' ? '#FFD700' : 'red', marginTop: 12, textAlign: 'center', fontWeight: 700 }}>{cartMessage}</div>}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Designs;
