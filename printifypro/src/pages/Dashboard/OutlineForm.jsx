import React, { useState, useRef } from "react";

const OutlineForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [featured, setFeatured] = useState(!!initialData.featured);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Outline name is required");
      return;
    }
    setError("");
    // Use FormData for file upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("featured", featured ? 1 : 0);
    if (imageFile) formData.append("image", imageFile);
    onSubmit(formData);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <h4>{initialData._id ? "Edit Outline" : "Add Outline"}</h4>
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
        <label>Category</label>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Abstract, Nature" />
      </div>
      <div className="form-group">
        <label>Image</label>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} />
        {initialData.image_url && !imageFile && (
          <div style={{marginTop: 8}}>
            <img src={initialData.image_url} alt="Outline" style={{maxWidth: 120, borderRadius: 6}} />
          </div>
        )}
      </div>
      <div className="form-group">
        <label>
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
          {' '}Featured Outline
        </label>
      </div>
      <div className="admin-form-actions">
        <button type="submit" className="admin-action-btn add">{initialData._id ? "Save" : "Add"}</button>
        {onCancel && <button type="button" className="admin-action-btn danger" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
};

export default OutlineForm;
