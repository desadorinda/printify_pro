import React, { useState, useEffect } from "react";

const ProductForm = ({ initialData = {}, collectionId, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [price, setPrice] = useState(initialData.price || "");
  const [stock, setStock] = useState(initialData.stock || "");
  const [tags, setTags] = useState(initialData.tags || "");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [collectionTags, setCollectionTags] = useState([]);

  useEffect(() => {
    // Fetch collection tags for suggestions
    if (collectionId) {
      fetch(`/api/admin/collections`)
        .then(res => res.json())
        .then(data => {
          const found = data.collections?.find(c => String(c.id) === String(collectionId));
          if (found && found.tags) {
            setCollectionTags(found.tags.split(',').map(t => t.trim()).filter(Boolean));
          }
        });
    }
  }, [collectionId]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleTagClick = (tag) => {
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!tagArr.includes(tag)) {
      setTags(tagArr.concat(tag).join(', '));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !collectionId) {
      setError("Name, price, and collection are required");
      return;
    }
    setError("");
    onSubmit({ name, description, price: parseFloat(price), stock: parseInt(stock, 10) || 0, collectionId, tags, images });
  };

  return (
    <form className="admin-form wide" onSubmit={handleSubmit}>
      <h4>{initialData.id ? "Edit Product" : "Add Product"}</h4>
      {error && <div className="admin-form-error">{error}</div>}
      <div className="form-group">
        <label>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Stock</label>
        <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Tags <span style={{ fontWeight: 400, color: '#888', fontSize: '0.95em' }}>(comma separated)</span></label>
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. modern, gold, minimal" />
        {collectionTags.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#bfa14a', fontWeight: 600, fontSize: '0.97em' }}>Collection tags:</span>
            {collectionTags.map((tag, i) => (
              <span key={i} style={{ background: '#fffbe6', color: '#bfa14a', border: '1px solid #f0e6c5', borderRadius: 5, padding: '0.13rem 0.7rem', fontSize: '0.93rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleTagClick(tag)}>{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="form-group">
        <label>Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        <div className="admin-form-image-preview">
          {images.map((img, idx) => (
            <div className="admin-form-thumb-wrap" key={idx}>
              <img
                src={URL.createObjectURL(img)}
                alt={`Preview ${idx+1}`}
                className="admin-form-thumb"
              />
              <button type="button" className="admin-form-thumb-remove" onClick={() => handleRemoveImage(idx)}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-form-actions">
        <button type="submit" className="admin-action-btn add">{initialData.id ? "Save" : "Add"}</button>
        {onCancel && <button type="button" className="admin-action-btn danger" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default ProductForm;
