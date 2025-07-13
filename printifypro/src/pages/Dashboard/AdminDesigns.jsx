import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import DesignForm from "./DesignForm";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';

const AdminDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/designs`);
      const data = await res.json();
      setDesigns(data.designs || []);
    } catch {
      setError("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = designs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedDesigns = designs.slice(startIdx, endIdx);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };
  const handleEdit = (design) => {
    setEditData(design);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this design? This cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/designs/${id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setDesigns(designs.filter(d => d._id !== id));
      } else {
        setError(result.error || "Failed to delete design");
      }
    } catch {
      setError("Failed to delete design");
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      let res, result;
      if (editData) {
        res = await fetch(`${API_BASE_URL}/admin/designs/${editData._id}`, {
          method: "PUT",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setDesigns(designs.map(d => d._id === editData._id ? result.design : d));
        } else {
          setError(result.error || "Failed to update design");
        }
      } else {
        res = await fetch(`${API_BASE_URL}/admin/designs`, {
          method: "POST",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setDesigns([result.design, ...designs]);
        } else {
          setError(result.error || "Failed to add design");
        }
      }
      setShowForm(false);
      setEditData(null);
    } catch {
      setError("Failed to save design");
    }
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  return (
    <div className="admin-section-content">
      {/* Designs Section Card */}
      <div style={{
        background: 'linear-gradient(120deg, #FFD700 60%, #111 100%)',
        color: '#111',
        borderRadius: 16,
        boxShadow: '0 4px 18px rgba(255,215,0,0.13)',
        padding: '2rem 1.5rem',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        width: '100%'
      }}>
        <FaPlus size={38} style={{ color: '#111', background: '#FFD700', borderRadius: '50%', padding: 8, marginRight: 18 }} />
        <div>
          <h2 style={{ margin: 0, color: '#111', fontWeight: 800, fontSize: 28 }}>Designs Management</h2>
          <div style={{ color: '#333', fontSize: 16, marginTop: 6, fontWeight: 500 }}>Add, edit, and manage all your design assets here. Use the gold button to add a new design to your collection.</div>
        </div>
      </div>
      <div className="admin-section-header">
        <h3 className="admin-section-title">Designs</h3>
        <button className="admin-action-btn add" onClick={handleAdd}> <FaPlus /> Add Design</button>
      </div>
      {showForm && (
        <DesignForm initialData={editData || {}} onSubmit={handleFormSubmit} onCancel={handleCancel} />
      )}
      <div className="admin-section-desc">Click a design to view or edit its details.</div>
      {loading ? <div>Loading designs...</div> : error ? <div className="settings-error">{error}</div> : (
        <div className="admin-card-grid">
          {paginatedDesigns.map((design) => (
            <div className="admin-card fancy" key={design._id}>
              <div className="admin-card-link" style={{ cursor: 'default' }}>
                {/* Design Image */}
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
                  {design.featured && <span className="admin-card-featured">★ Featured</span>}
                </div>
                <div className="admin-card-desc">{design.description || <span className="muted">No description</span>}</div>
                {/* Tags */}
                {design.tags && design.tags.length > 0 && (
                  <div className="admin-card-tags">
                    {design.tags.split(',').map((tag, i) => (
                      <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="admin-card-meta">
                  <span className="admin-card-date">Created: {design.created_at ? new Date(design.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                </div>
              </div>
              <div className="admin-card-actions">
                <button className="admin-action-btn edit" onClick={() => handleEdit(design)}> <FaEdit /> Edit</button>
                <button className="admin-action-btn danger" onClick={() => handleDelete(design._id)}> <FaTrash /> Delete</button>
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
      {/* Debug output */}
      <div style={{marginTop: 24, background: '#f8f8f8', padding: 12, borderRadius: 8, fontSize: 13}}>
        <strong>Debug Info:</strong>
        <div><b>Error:</b> {error ? error : 'None'}</div>
        <div><b>Designs array:</b> <pre style={{whiteSpace:'pre-wrap', wordBreak:'break-all'}}>{JSON.stringify(designs, null, 2)}</pre></div>
      </div>
    </div>
  );
};

export default AdminDesigns;
