const pool = require('../config/db');

// Sample user controller
exports.getUsers = (req, res) => {
  res.json([{ id: 1, name: 'John Doe' }]);
};

exports.getUserStats = async (req, res) => {
  const userId = req.user.id;
  try {
    // Likes
    const [likesRows] = await pool.query('SELECT COUNT(*) as totalLikes FROM likes WHERE user_id = ?', [userId]);
    // Cart items (only active cart)
    const [cartRows] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active" ORDER BY id DESC LIMIT 1', [userId]);
    let totalCartItems = 0;
    if (cartRows.length) {
      const cartId = cartRows[0].id;
      const [cartItemsRows] = await pool.query('SELECT COUNT(*) as totalCartItems FROM cart_items WHERE cart_id = ?', [cartId]);
      totalCartItems = cartItemsRows[0].totalCartItems;
    }
    // Orders
    const [ordersRows] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders WHERE user_id = ?', [userId]);
    // Reviews
    const [reviewsRows] = await pool.query('SELECT COUNT(*) as totalReviews FROM reviews WHERE user_id = ?', [userId]);

    res.json({
      totalLikes: likesRows[0].totalLikes,
      totalCartItems,
      totalOrders: ordersRows[0].totalOrders,
      totalReviews: reviewsRows[0].totalReviews
    });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserLikedProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get all liked product IDs for this user
    const [likes] = await pool.query('SELECT product_id FROM likes WHERE user_id = ?', [userId]);
    if (!likes.length) return res.json({ products: [] });
    const productIds = likes.map(like => like.product_id);
    // Fetch product details for all liked products, including collection_id
    const [products] = await pool.query(
      `SELECT id, name, description, price, collection_id,
        (SELECT image_url FROM product_images WHERE product_id = products.id LIMIT 1) as image_url
       FROM products WHERE id IN (?)`, [productIds]
    );
    res.json({ products });
  } catch (err) {
    console.error('Get user liked products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const [orders] = await pool.query(
      'SELECT id, total_amount, status, payment_method, shipping_address, placed_at, recipient_name, phone, email, notes FROM orders WHERE user_id = ? ORDER BY placed_at DESC',
      [userId]
    );
    res.json({ orders });
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrderItems = async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  try {
    // Fetch the order and ensure it belongs to the user
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (!orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orders[0];
    // Fetch all order items with all fields and product name
    const [items] = await pool.query(
      `SELECT oi.*, p.name as product_name, p.description as product_description, p.collection_id,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    res.json({ order, items });
  } catch (err) {
    console.error('Get order items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a review (only if user has completed an order for the product)
exports.addReview = async (req, res) => {
  const userId = req.user.id;
  const { product_id, rating, comment } = req.body;
  if (!product_id || !rating) {
    return res.status(400).json({ error: 'Product and rating are required' });
  }
  try {
    // Debug: log user and product
    console.log('Review check for user:', userId, 'product:', product_id);
    // Check if user has a completed order for this product (any order_items row with this product and a completed order)
    const [rows] = await pool.query(
      `SELECT oi.id, o.id as order_id, o.status FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'completed'`,
      [parseInt(product_id), userId]
    );
    console.log('Completed order_items found:', rows);
    if (!rows.length) {
      return res.status(403).json({ error: 'You can only review products you have purchased and completed.' });
    }
    // Prevent duplicate review
    const [existing] = await pool.query('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [userId, product_id]);
    if (existing.length) {
      return res.status(409).json({ error: 'You have already reviewed this product.' });
    }
    // Insert review
    await pool.query('INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)', [userId, product_id, rating, comment || null]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  const productId = req.params.productId;
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json({ reviews });
  } catch (err) {
    console.error('Get product reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get reviews for the logged-in user
exports.getUserReviews = async (req, res) => {
  const userId = req.user.id;
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, p.name AS product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json({ reviews });
  } catch (err) {
    console.error('Get user reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add custom design request
exports.addCustomDesignRequest = async (req, res) => {
  try {
    // Only allow user_id if authenticated, else null
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else if (req.headers['authorization']) {
      // Try to decode token if present (for non-protected route)
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        userId = null;
      }
    }
    const { name, email, phone, product, description } = req.body;
    let reference_image = null;
    if (req.file) {
      reference_image = '/uploads/' + req.file.filename;
    }
    if (!name || !email || !product || !description || !phone) {
      return res.status(400).json({ error: 'All fields except reference image are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO custom_design_requests (user_id, name, email, phone, product, description, reference_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, phone, product, description, reference_image]
    );
    res.status(201).json({ success: true, id: result.insertId, user_id: userId });
  } catch (err) {
    console.error('Add custom design request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
