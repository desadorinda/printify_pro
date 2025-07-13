import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaBox, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import ProductForm from "./ProductForm";
import "./AdminDashboard.css";
import { API_BASE_URL } from '../../config';

const ProductsByCollection = () => {
  const { collectionId } = useParams();
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCollection();
    fetchProducts();
    // eslint-disable-next-line
  }, [collectionId]);

  const fetchCollection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/collections`);
      const data = await res.json();
      if (data.collections) {
        const found = data.collections.find(c => String(c.id) === String(collectionId));
        setCollection(found || null);
      }
    } catch {
      setCollection(null);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/collections/${collectionId}/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedProducts = products.slice(startIdx, endIdx);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };
  const handleEdit = (prod) => {
    setEditData(prod);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        setError("Failed to delete product");
      }
    } catch {
      setError("Failed to delete product");
    }
  };
  const handleFormSubmit = async (data) => {
    try {
      let res, result;
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("stock", data.stock);
      formData.append("collection_id", collectionId);
      if (data.images && data.images.length > 0) {
        data.images.forEach(img => formData.append("images", img));
      }
      if (editData) {
        res = await fetch(`${API_BASE_URL}/admin/products/${editData.id}`, {
          method: "PUT",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setProducts(products.map(p => p.id === editData.id ? result.product : p));
        } else {
          setError(result.error || "Failed to update product");
        }
      } else {
        res = await fetch(`${API_BASE_URL}/admin/products`, {
          method: "POST",
          body: formData
        });
        result = await res.json();
        if (res.ok) {
          setProducts([result.product, ...products]);
        } else {
          setError(result.error || "Failed to add product");
        }
      }
      setShowForm(false);
      setEditData(null);
    } catch {
      setError("Failed to save product");
    }
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  // --- Render collection details at the top ---
  const renderCollectionDetails = () => {
    if (!collection) return null;
    return (
      <div className="admin-section-content" style={{ marginBottom: 24, background: '#fffbe6', border: '1.5px solid #f0e6c5', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          {collection.image_url && (
            <img
              src={collection.image_url.startsWith('/uploads') ? API_BASE_URL.replace(/\/api$/, '') + collection.image_url : collection.image_url}
              alt={collection.name}
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8, background: '#fff', border: '1px solid #f0e6c5' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h4 style={{ margin: 0, color: '#bfa14a', fontWeight: 700 }}>{collection.name}</h4>
              {collection.featured && <span className="admin-card-featured">★ Featured</span>}
            </div>
            <div style={{ color: '#888', margin: '6px 0 8px 0' }}>{collection.description || <span className="muted">No description</span>}</div>
            {collection.tags && collection.tags.length > 0 && (
              <div className="admin-card-tags">
                {collection.tags.split(',').map((tag, i) => (
                  <span className="admin-card-tag" key={i}>{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-section-content">
      {renderCollectionDetails()}
      <div className="admin-section-header">
        <h3 className="admin-section-title">Products in Collection #{collectionId}</h3>
        <button className="admin-action-btn add" onClick={handleAdd}> <FaPlus /> Add Product</button>
      </div>
      {showForm && (
        <ProductForm initialData={editData || {}} collectionId={collectionId} onSubmit={handleFormSubmit} onCancel={handleCancel} />
      )}
      <div className="admin-section-desc">Click a product to view details.</div>
      {loading ? <div>Loading products...</div> : error ? <div className="settings-error">{error}</div> : (
        <div className="admin-card-grid">
          {paginatedProducts.map((p) => (
            <div className="admin-card fancy" key={p.id}>
              <Link to={`/admin-dashboard/products/${p.id}`} className="admin-card-link">
                <div className="admin-card-icon"><FaBox /></div>
                <div className="admin-card-title">{p.name}</div>
                <div className="admin-card-desc">{p.description}</div>
                <div className="admin-card-meta">
                  <span className="admin-card-date">Price: ${p.price} | Stock: {p.stock}</span>
                  <span className="admin-card-id">Images: {p.images ? p.images.length : 0}</span>
                </div>
              </Link>
              <div className="admin-card-actions">
                <button className="admin-action-btn edit" onClick={() => handleEdit(p)}> <FaEdit /> Edit</button>
                <button className="admin-action-btn danger" onClick={() => handleDelete(p.id)}> <FaTrash /> Delete</button>
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

export default ProductsByCollection;
