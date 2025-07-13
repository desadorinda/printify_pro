import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../../config';

const AdminSettings = () => {
  const [viewMode, setViewMode] = useState(true); // true: view, false: edit
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
          setUsername(data.user?.username || data.username || "");
          setEmail(data.user?.email || data.email || "");
        } else {
          setError("Failed to load user info");
        }
      } catch {
        setError("Failed to load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password: password || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSuccess("Profile updated successfully!");
        setViewMode(true);
        setPassword("");
      } else {
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-section-content">Loading...</div>;

  return (
    <div className="admin-section-content admin-settings-advanced">
      <h3 className="admin-section-title">Admin Settings</h3>
      <div className="admin-section-desc">Manage your profile, security, and app preferences.</div>
      <div style={{ marginBottom: 18 }}>
        <button className="admin-action-btn" onClick={() => setViewMode(v => !v)}>
          {viewMode ? "Edit Profile" : "View Profile"}
        </button>
      </div>
      {viewMode ? (
        <div className="settings-view-box">
          <div><b>Username:</b> {user?.username}</div>
          <div><b>Email:</b> {user?.email}</div>
          <div><b>Role:</b> {user?.role}</div>
          <div><b>Created At:</b> {user?.created_at ? new Date(user.created_at).toLocaleString() : ''}</div>
        </div>
      ) : (
        <form className="admin-settings-form" onSubmit={handleSubmit}>
          <div className="settings-row">
            <div className="settings-col">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Change Password</label>
                <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          {success && <div className="settings-success">{success}</div>}
          {error && <div className="settings-error">{error}</div>}
          <div className="admin-form-actions">
            <button className="admin-action-btn add" type="submit">Save Changes</button>
          </div>
        </form>
      )}
      <div className="settings-footer">
        <h4>Security Tips</h4>
        <ul>
          <li>Use a strong password and change it regularly.</li>
          <li>Enable notifications for important updates.</li>
          <li>Keep your email up to date for account recovery.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
