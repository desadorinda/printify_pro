import React from "react";

const AdminCartItems = () => (
  <div className="admin-section-content">
    <h3 className="admin-section-title">Cart Items</h3>
    <div className="admin-section-desc">View items currently in user carts.</div>
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Product ID</th>
            <th>Quantity</th>
            <th>Added At</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>2</td>
            <td>101</td>
            <td>3</td>
            <td>2025-06-01</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminCartItems;
