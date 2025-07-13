import React, { useState, useEffect } from "react";
import { FaUser, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import { API_BASE_URL } from '../../config';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
//   const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users.map(u => ({
          ...u,
          name: u.username,
          joined: u.created_at?.slice(0, 10)
        })));
        // setTotal(data.total);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users");
        setLoading(false);
      });
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-section-content admin-users-advanced">
      <div className="admin-section-header">
        <h3 className="admin-section-title">User Management</h3>
        {/* <span className="admin-users-count">Total: {total}</span> */}
        {/* <button className="admin-action-btn add"><FaPlus /> Add User</button> */}
      </div>
      <div className="admin-section-desc">View, search, add, edit, or remove users from the system.</div>
      <div className="admin-users-toolbar">
        <FaSearch className="admin-users-search-icon" />
        <input
          className="admin-users-search"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? <div>Loading users...</div> : error ? <div className="settings-error">{error}</div> : (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><FaUser className="admin-users-avatar" /> {u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status === "active" ? <span className="status-active"><FaCheckCircle /> Active</span> : <span className="status-inactive"><FaTimesCircle /> Inactive</span>}</td>
                <td>{u.joined}</td>
                <td>
                  {/* <button className="admin-action-btn edit"><FaEdit /> Edit</button> */}
                  <button className="admin-action-btn danger"><FaTrash /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default AdminUsers;
