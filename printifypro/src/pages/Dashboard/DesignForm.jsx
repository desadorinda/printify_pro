import React, { useState, useRef } from "react";

const DesignForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [tags, setTags] = useState(initialData.tags || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [price, setPrice] = useState(initialData.price || "");
  const [featured, setFeatured] = useState(!!initialData.featured);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Design name is required");
      return;
    }
    setError("");
    // Use FormData for file upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("category", category);
    formData.append("featured", featured ? 1 : 0);
    formData.append("price", price);
    if (imageFile) formData.append("image", imageFile);
    onSubmit(formData);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
      {/* Design details preview section */}
      <div className="design-details-preview" style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 18, boxShadow: '0 2px 8px #eee' }}>
        <h4 style={{ marginBottom: 8, color: '#FFD700', fontWeight: 700 }}>Design Details Preview</h4>
        <div style={{ marginBottom: 6 }}><strong>Name:</strong> {name || initialData.name || <span className="muted">No name</span>}</div>
        <div style={{ marginBottom: 6 }}><strong>Description:</strong> {description || initialData.description || <span className="muted">No description</span>}</div>
        <div style={{ marginBottom: 6 }}><strong>Price:</strong> {price || initialData.price ? `₦${price || initialData.price}` : <span className="muted">No price</span>}</div>
        <div style={{ marginBottom: 6 }}><strong>Category:</strong> {category || initialData.category || <span className="muted">No category</span>}</div>
        <div style={{ marginBottom: 6 }}><strong>Tags:</strong> {tags || initialData.tags || <span className="muted">No tags</span>}</div>
        {(imageFile || initialData.image_url) && (
          <div style={{ marginTop: 8 }}>
            <img src={imageFile ? URL.createObjectURL(imageFile) : initialData.image_url} alt="Design" style={{ maxWidth: 120, borderRadius: 6 }} />
          </div>
        )}
      </div>
      <h4>{initialData._id ? "Edit Design" : "Add Design"}</h4>
      {error && <div className="admin-form-error">{error}</div>}
      <div className="form-group">
        <label>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      {/* Show price in details section if available */}
      {(price || initialData.price) && (
        <div style={{ fontWeight: 700, color: '#FFD700', marginBottom: 12, fontSize: 18 }}>
          Price: ₦{price || initialData.price}
        </div>
      )}
      <div className="form-group">
        <label>Tags <span className="muted">(comma separated)</span></label>
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. abstract, modern, floral" />
      </div>
      <div className="form-group">
        <label>Category</label>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Abstract, Nature" />
      </div>
      <div className="form-group">
        <label>Price (₦)</label>
        <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 5000" />
      </div>
      <div className="form-group">
        <label>Image</label>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} />
        {initialData.image_url && !imageFile && (
          <div style={{marginTop: 8}}>
            <img src={initialData.image_url} alt="Design" style={{maxWidth: 120, borderRadius: 6}} />
          </div>
        )}
      </div>
      {/* Show price below image if available */}
      {(price || initialData.price) && (
        <div style={{ fontWeight: 700, color: '#FFD700', marginBottom: 12, fontSize: 18 }}>
          Price: ₦{price || initialData.price}
        </div>
      )}
      <div className="form-group">
        <label>
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
          {' '}Featured Design
        </label>
      </div>
      <div className="admin-form-actions">
        <button type="submit" className="admin-action-btn add">{initialData._id ? "Save" : "Add"}</button>
        {onCancel && <button type="button" className="admin-action-btn danger" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default DesignForm;
