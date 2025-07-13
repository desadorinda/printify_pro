import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBox, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import CollectionForm from "./CollectionForm";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';

const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCollections();
    
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/collections`);
      const data = await res.json();
      setCollections(data.collections || []);
    } catch {
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = collections.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedCollections = collections.slice(startIdx, endIdx);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };
  const handleEdit = (col) => {
    setEditData(col);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection? This cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/collections/${id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCollections(collections.filter(c => c.id !== id));
      } else {
        setError(result.error || "Failed to delete collection");
      }
    } catch {
      setError("Failed to delete collection");
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      let res, result;
      if (editData) {
        res = await fetch(`${API_BASE_URL}/admin/collections/${editData.id}`, {
          method: "PUT",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setCollections(collections.map(c => c.id === editData.id ? result.collection : c));
        } else {
          setError(result.error || "Failed to update collection");
        }
      } else {
        res = await fetch(`${API_BASE_URL}/admin/collections`, {
          method: "POST",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setCollections([result.collection, ...collections]);
        } else {
          setError(result.error || "Failed to add collection");
        }
      }
      setShowForm(false);
      setEditData(null);
    } catch {
      setError("Failed to save collection");
    }
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  return (
    <div className="admin-section-content">
      <div className="admin-section-header">
        <h3 className="admin-section-title">Collections</h3>
        <button className="admin-action-btn add" onClick={handleAdd}> <FaPlus /> Add Collection</button>
      </div>
      {showForm && (
        <CollectionForm initialData={editData || {}} onSubmit={handleFormSubmit} onCancel={handleCancel} />
      )}
      <div className="admin-section-desc">Click a collection to view its products.</div>
      {loading ? <div>Loading collections...</div> : error ? <div className="settings-error">{error}</div> : (
        <div className="admin-card-grid">
          {paginatedCollections.map((col) => (
            <div className="admin-card fancy" key={col.id}>
              <Link to={`/admin-dashboard/collections/${col.id}/products`} className="admin-card-link">
                {/* Collection Image */}
                {col.image_url && (
                  <img
                    src={col.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + col.image_url : col.image_url}
                    alt={col.name}
                    className="admin-card-collection-img"
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12, background: '#fff' }}
                  />
                )}
                <div className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {col.name}
                  {col.featured && <span className="admin-card-featured">★ Featured</span>}
                </div>
                <div className="admin-card-desc">{col.description || <span className="muted">No description</span>}</div>
                {/* Tags */}
                {col.tags && col.tags.length > 0 && (
                  <div className="admin-card-tags">
                    {col.tags.split(',').map((tag, i) => (
                      <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="admin-card-meta">
                  <span className="admin-card-date">Created: {col.created_at ? new Date(col.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                </div>
              </Link>
              <div className="admin-card-actions">
                <button className="admin-action-btn edit" onClick={() => handleEdit(col)}> <FaEdit /> Edit</button>
                <button className="admin-action-btn danger" onClick={() => handleDelete(col.id)}> <FaTrash /> Delete</button>
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
    </div>
  );
};

export default AdminCollections;
