const pool = require('../config/db');

// Create a new custom design request
exports.createCustomDesignRequest = async (req, res) => {
  try {
    const { name, email, description, products } = req.body;
    if (!name || !email || !description || !products) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Insert into custom_design_requests table
    await pool.query(
      'INSERT INTO custom_design_requests (name, email, description, product, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, description, products]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Custom design request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
