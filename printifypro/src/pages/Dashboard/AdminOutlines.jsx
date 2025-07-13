import React, { useState, useEffect } from "react";
import { FaBox, FaPlus, FaEdit, FaTrash, FaShoppingCart } from "react-icons/fa";
import OutlineForm from "./OutlineForm";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';
import { addDesignToCart } from '../../api';
import { useCart } from '../../Context/CartContext';
import { useNavigate } from 'react-router-dom';

function AddDesignForm({ outlineId, onDesignAdded }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      setError('Price is required and must be a positive number');
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    if (form.image) formData.append('image', form.image);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/outlines/${outlineId}/designs`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSuccess(true);
        setShow(false);
        setForm({ name: '', description: '', price: '', image: null });
        if (onDesignAdded) onDesignAdded();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add design');
      }
    } catch {
      setError('Failed to add design');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return (
      <button className="admin-action-btn add" onClick={() => setShow(true)}>
        <FaPlus /> Add Design
      </button>
    );
  }
  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12, background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ marginBottom: 8, width: '100%' }} />
      <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required style={{ marginBottom: 8, width: '100%' }} />
      <input type="number" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0.01" step="0.01" style={{ marginBottom: 8, width: '100%' }} />
      <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} style={{ marginBottom: 8 }} />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="admin-action-btn add" disabled={loading}>{loading ? 'Adding...' : 'Add Design'}</button>
      <button type="button" className="admin-action-btn danger" style={{ marginLeft: 8 }} onClick={() => setShow(false)}>Cancel</button>
      {success && <div style={{ color: 'green', marginTop: 8 }}>Design added!</div>}
    </form>
  );
}

const AdminOutlines = () => {
  const [outlines, setOutlines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [editDesign, setEditDesign] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const itemsPerPage = 10;
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutlines();
  }, []);

  const fetchOutlines = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/outlines`);
      const data = await res.json();
      setOutlines(data.outlines || []);
    } catch {
      setError("Failed to load outlines");
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignsForOutline = async (outlineId) => {
    setLoadingDesigns(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/outlines/${outlineId}/designs`);
      const data = await res.json();
      setDesigns(data.designs || []);
    } catch {
      setDesigns([]);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };
  const handleEdit = (outline) => {
    setEditData(outline);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this outline? This cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/outlines/${id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setOutlines(outlines.filter(o => (o.id || o._id) !== id));
      } else {
        setError(result.error || "Failed to delete outline");
      }
    } catch {
      setError("Failed to delete outline");
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      let res, result;
      if (editData) {
        res = await fetch(`${API_BASE_URL}/admin/outlines/${editData._id}`, {
          method: "PUT",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setOutlines(outlines.map(o => o._id === editData._id ? result.outline : o));
        } else {
          setError(result.error || "Failed to update outline");
        }
      } else {
        res = await fetch(`${API_BASE_URL}/admin/outlines`, {
          method: "POST",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setOutlines([result.outline, ...outlines]);
        } else {
          setError(result.error || "Failed to add outline");
        }
      }
      setShowForm(false);
      setEditData(null);
    } catch {
      setError("Failed to save outline");
    }
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Pagination
  const totalItems = outlines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedOutlines = outlines.slice(startIdx, endIdx);

  // Outline selection
  const handleSelectOutline = (outline) => {
    setSelectedOutline(outline);
    if (outline.id || outline._id) {
      fetchDesignsForOutline(outline.id || outline._id);
    }
  };
  const handleBackToOutlines = () => {
    setSelectedOutline(null);
    setDesigns([]);
  };

  // Add to cart handler
  const handleAddToCart = async (designId) => {
    setCartLoading(true);
    setCartMessage("");
    const token = localStorage.getItem('token');
    try {
      await addDesignToCart(designId, token, 1);
      setCartMessage("Added to cart!");
      if (refreshCart && token) await refreshCart(token); // Refresh cart context after add
    } catch (err) {
      setCartMessage(err?.response?.data?.error || "Failed to add to cart");
    } finally {
      setCartLoading(false);
      setTimeout(() => setCartMessage(""), 2000);
    }
  };

  // Handler for editing a design
  const handleEditDesign = (designId) => {
    const design = designs.find(d => (d.id || d._id) === designId);
    setEditDesign(design);
    setShowEditModal(true);
  };

  return (
    <div className="admin-section-content">
      {!selectedOutline ? (
        <>
          <div className="admin-section-header">
            <h3 className="admin-section-title">Outlines</h3>
            <button className="admin-action-btn add" onClick={handleAdd}> <FaPlus /> Add Outline</button>
          </div>
          {showForm && (
            <OutlineForm initialData={editData || {}} onSubmit={handleFormSubmit} onCancel={handleCancel} />
          )}
          <div className="admin-section-desc">Click an outline to view its designs.</div>
          {loading ? <div>Loading outlines...</div> : error ? <div className="settings-error">{error}</div> : (
            <div className="admin-card-grid">
              {paginatedOutlines.map((outline) => (
                <div className="admin-card fancy" key={outline.id || outline._id}>
                  <div className="admin-card-link" style={{ cursor: 'pointer' }} onClick={() => handleSelectOutline(outline)}>
                    {outline.image_url && (
                      <img
                        src={outline.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + outline.image_url : outline.image_url}
                        alt={outline.name}
                        className="admin-card-collection-img"
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12, background: '#fff' }}
                      />
                    )}
                    <div className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {outline.name}
                      {outline.featured && <span className="admin-card-featured">★ Featured</span>}
                    </div>
                    <div className="admin-card-desc">{outline.description || <span className="muted">No description</span>}</div>
                    <div className="admin-card-meta">
                      <span className="admin-card-date">Created: {outline.created_at ? new Date(outline.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <button className="admin-action-btn edit" onClick={() => handleEdit(outline)}> <FaEdit /> Edit</button>
                    <button className="admin-action-btn danger" onClick={() => handleDelete(outline.id || outline._id)}> <FaTrash /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
      ) : (
        <>
          <div style={{ margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-action-btn" style={{ background: '#222', color: '#FFD700', border: '1px solid #FFD700' }} onClick={handleBackToOutlines}>
              ← Back to Outlines
            </button>
            <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: 28, margin: 0 }}>{selectedOutline.name}</h2>
          </div>
          <AddDesignForm outlineId={selectedOutline && (selectedOutline.id || selectedOutline._id)} onDesignAdded={() => fetchDesignsForOutline(selectedOutline && (selectedOutline.id || selectedOutline._id))} />
          <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: '#222', fontWeight: 700, fontSize: 22, letterSpacing: 0.5}}>Custom Designs</h3>
          {loadingDesigns ? (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>Loading designs...</div>
          ) : (
            <div className="admin-card-grid">
              {designs.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No designs in this outline.</div>
              ) : (
                designs.map((design, index) => (
                  <div
                    key={design.id || design._id}
                    className="admin-card fancy"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="admin-card-link" style={{ cursor: 'default' }}>
                      {design.image_url && (
                        <img
                          src={design.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + design.image_url : design.image_url}
                          alt={design.name}
                          className="admin-card-collection-img"
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12, background: '#fff' }}
                        />
                      )}
                      <div className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {design.name}
                      </div>
                      <div className="admin-card-desc">{design.description || <span className="muted">No description</span>}</div>
                      <div className="admin-card-meta">
                        <span className="admin-card-date">Created: {design.created_at ? new Date(design.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          className="admin-action-btn add"
                          style={{ flex: 1 }}
                          onClick={() => handleAddToCart(design.id || design._id)}
                          disabled={cartLoading}
                        >
                          <FaShoppingCart style={{ marginRight: 6 }} />
                          {cartLoading ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button
                          className="admin-action-btn edit"
                          style={{ flex: 1 }}
                          onClick={() => handleEditDesign(design.id || design._id)}
                        >
                          <FaEdit style={{ marginRight: 6 }} /> Edit
                        </button>
                        <button
                          className="admin-action-btn danger"
                          style={{ flex: 1 }}
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to delete this design?')) return;
                            try {
                              const res = await fetch(`${API_BASE_URL}/admin/designs/${design.id || design._id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setDesigns(designs => designs.filter(d => (d.id || d._id) !== (design.id || design._id)));
                              } else {
                                alert('Failed to delete design.');
                              }
                            } catch {
                              alert('Failed to delete design.');
                            }
                          }}
                        >
                          <FaTrash style={{ marginRight: 6 }} /> Delete
                        </button>
                      </div>
                      {cartMessage && <div style={{ color: cartMessage === 'Added to cart!' ? 'green' : 'red', marginTop: 6 }}>{cartMessage}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {showEditModal && editDesign && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 340, maxWidth: 400, width: '100%', position: 'relative', color: '#222', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 28, color: '#FFD700', cursor: 'pointer' }} onClick={() => { setShowEditModal(false); setEditDesign(null); }}>&times;</button>
            <h2 style={{ color: '#FFD700', fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Describe how you want it to be</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // You can handle the submission as needed, e.g., send the description to backend or update state
              setShowEditModal(false);
              setEditDesign(null);
            }}>
              <div className="form-group">
                <textarea
                  placeholder="Describe how you want it to be..."
                  value={editDesign.description || ''}
                  onChange={e => setEditDesign(d => ({ ...d, description: e.target.value }))}
                  required
                  style={{ width: '100%', minHeight: 120, marginBottom: 16 }}
                />
              </div>
              <button type="submit" className="admin-action-btn add" style={{ width: '100%', marginTop: 16 }}>Save</button>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminOutlines;
