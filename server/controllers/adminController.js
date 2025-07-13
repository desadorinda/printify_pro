// Admin registration controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer setup for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Export upload for use in routes
module.exports.upload = upload;

exports.registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    // Check if admin exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert admin with role 'admin'
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')",
      [username, email, hashedPassword]
    );
    // Get new admin
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [result.insertId]);
    const admin = rows[0];
    // Generate JWT
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: admin, token });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, status, created_at FROM users ORDER BY id DESC'
    );
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM users');
    res.json({ users, total: countRows[0].total });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all collections
exports.getAllCollections = async (req, res) => {
  try {
    const [collections] = await pool.query('SELECT * FROM collections ORDER BY id DESC');
    // Prepend /uploads/ if not present for image_url
    collections.forEach(col => {
      if (col.image_url && !col.image_url.startsWith('http') && !col.image_url.startsWith('/uploads/')) {
        col.image_url = `/uploads/${col.image_url.replace(/^\/+/,'')}`;
      }
    });
    res.json({ collections });
  } catch (err) {
    console.error('Get all collections error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add collection (with image upload)
exports.addCollection = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    // Fix: always coerce featured to 1 or 0, default to 0 if missing or falsy
    let featured = 0;
    if (typeof req.body.featured !== 'undefined') {
      featured = req.body.featured == 1 || req.body.featured === '1' ? 1 : 0;
    }
    if (!name) return res.status(400).json({ error: 'Name is required' });
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const [result] = await pool.query(
      'INSERT INTO collections (name, description, tags, image_url, featured) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, tags || null, imageUrl, featured]
    );
    const [rows] = await pool.query('SELECT * FROM collections WHERE id = ?', [result.insertId]);
    res.status(201).json({ collection: rows[0] });
  } catch (err) {
    console.error('Add collection error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Edit collection (with image upload)
exports.editCollection = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, tags, featured } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    // If new image, update image_url, else keep old
    let updateSql = 'UPDATE collections SET name = ?, description = ?, tags = ?, featured = ?';
    let params = [name, description || null, tags || null, featured ? 1 : 0];
    if (imageUrl) {
      updateSql += ', image_url = ?';
      params.push(imageUrl);
    }
    updateSql += ' WHERE id = ?';
    params.push(id);
    await pool.query(updateSql, params);
    const [rows] = await pool.query('SELECT * FROM collections WHERE id = ?', [id]);
    res.json({ collection: rows[0] });
  } catch (err) {
    console.error('Edit collection error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get products by collection
exports.getProductsByCollection = async (req, res) => {
  const { collectionId } = req.params;
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE collection_id = ? ORDER BY id DESC',
      [collectionId]
    );
    for (let product of products) {
      const [images] = await pool.query(
        'SELECT * FROM product_images WHERE product_id = ?',
        [product.id]
      );
      product.images = images;
    }
    res.json({ products });
  } catch (err) {
    console.error('Get products by collection error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add product (with images)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, collection_id, tags } = req.body;
    if (!name || !price || !collection_id) {
      return res.status(400).json({ error: 'Name, price, and collection are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock, collection_id, tags) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, price, stock || 0, collection_id, tags || null]
    );
    const productId = result.insertId;
    // Handle images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`;
        await pool.query(
          'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
          [productId, imageUrl]
        );
      }
    }
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    res.status(201).json({ product: rows[0] });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Edit product (with images)
exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, collection_id, tags } = req.body;
    if (!name || !price || !collection_id) {
      return res.status(400).json({ error: 'Name, price, and collection are required' });
    }
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, collection_id = ?, tags = ? WHERE id = ?',
      [name, description || null, price, stock || 0, collection_id, tags || null, id]
    );
    // Optionally handle new images (not removing old ones here)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`;
        await pool.query(
          'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
          [id, imageUrl]
        );
      }
    }
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ product: rows[0] });
  } catch (err) {
    console.error('Edit product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete product and its images
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete images from disk
    const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
    for (const img of images) {
      const filePath = img.image_url.startsWith('/uploads/') ? img.image_url.replace('/uploads/', '') : img.image_url;
      const absPath = require('path').join(__dirname, '../../uploads', filePath);
      try { require('fs').unlinkSync(absPath); } catch {}
    }
    // Delete product (cascades to product_images)
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get product details (with images, likes, reviews, orders count)
exports.getProductDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const [images] = await pool.query('SELECT id, image_url FROM product_images WHERE product_id = ?', [id]);
    // Prepend /uploads/ if not present
    product.images = images.map(img => ({ ...img, image_url: img.image_url.startsWith('http') ? img.image_url : (img.image_url.startsWith('/uploads/') ? img.image_url : `/uploads/${img.image_url.replace(/^\/+/, '')}`) }));
    const [likes] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE product_id = ?', [id]);
    const [reviews] = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE product_id = ?', [id]);
    const [orders] = await pool.query('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?', [id]);
    res.json({
      product: {
        ...product,
        images,
        likes: likes[0].count,
        reviews: reviews[0].count,
        orders: orders[0].count
      }
    });
  } catch (err) {
    console.error('Get product details error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get likes for a product (with user check)
exports.getProductLikes = async (req, res) => {
  const { id } = req.params;
  let userId = undefined;
  // Try to decode token if present
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (e) {
      // ignore invalid token, treat as guest
    }
  }
  try {
    const [likes] = await pool.query(
      'SELECT likes.id, users.username, users.email, likes.user_id, likes.created_at FROM likes JOIN users ON likes.user_id = users.id WHERE likes.product_id = ? ORDER BY likes.created_at DESC',
      [id]
    );
    let userLiked = false;
    if (userId) {
      userLiked = likes.some(like => like.user_id === userId);
    }
    res.json({ likes, userLiked });
  } catch (err) {
    console.error('Get product likes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const [reviews] = await pool.query(
      'SELECT reviews.id, users.username, users.email, reviews.rating, reviews.comment, reviews.created_at FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.product_id = ? ORDER BY reviews.created_at DESC',
      [id]
    );
    res.json({ reviews });
  } catch (err) {
    console.error('Get product reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get orders for a product
exports.getProductOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await pool.query(
      `SELECT order_items.id, orders.id AS order_id, users.username, users.email, order_items.quantity, order_items.price, orders.status, orders.placed_at
       FROM order_items
       JOIN orders ON order_items.order_id = orders.id
       JOIN users ON orders.user_id = users.id
       WHERE order_items.product_id = ?
       ORDER BY orders.placed_at DESC`,
      [id]
    );
    res.json({ orders });
  } catch (err) {
    console.error('Get product orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete collection and its products/images
exports.deleteCollection = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete all product images for products in this collection
    const [products] = await pool.query('SELECT id FROM products WHERE collection_id = ?', [id]);
    for (const product of products) {
      const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ?', [product.id]);
      for (const img of images) {
        const filePath = img.image_url.startsWith('/uploads/') ? img.image_url.replace('/uploads/', '') : img.image_url;
        const absPath = require('path').join(__dirname, '../../uploads', filePath);
        try { require('fs').unlinkSync(absPath); } catch {}
      }
      await pool.query('DELETE FROM product_images WHERE product_id = ?', [product.id]);
    }
    // Delete products in this collection
    await pool.query('DELETE FROM products WHERE collection_id = ?', [id]);
    // Delete the collection itself
    await pool.query('DELETE FROM collections WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete collection error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Like a product
exports.likeProduct = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Use JWT or fallback to body
    const productId = req.params.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    // Prevent duplicate likes
    const [existing] = await pool.query('SELECT * FROM likes WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already liked' });
    }
    await pool.query('INSERT INTO likes (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Like product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unlike a product
exports.unlikeProduct = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const productId = req.params.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [existing] = await pool.query('SELECT * FROM likes WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Not liked yet' });
    }
    await pool.query('DELETE FROM likes WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Unlike product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    // Accept both productId and product_id from frontend
    const { productId, product_id, quantity = 1, description = null } = req.body;
    const prodId = productId || product_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check product exists and is in stock
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [prodId]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Not enough stock' });

    // Find or create active cart
    let [cartRows] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
    let cartId;
    if (cartRows.length === 0) {
      const [result] = await pool.query('INSERT INTO carts (user_id, status) VALUES (?, "active")', [userId]);
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // Check if item already in cart
    const [[existingItem]] = await pool.query('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, prodId]);
    if (existingItem) {
      // Update quantity and description (do not exceed stock)
      const newQty = Math.min(existingItem.quantity + quantity, product.stock);
      await pool.query('UPDATE cart_items SET quantity = ?, description = ? WHERE id = ?', [newQty, description, existingItem.id]);
    } else {
      await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity, description) VALUES (?, ?, ?, ?)', [cartId, prodId, Math.min(quantity, product.stock), description]);
    }
    // Return updated cart
    return exports.getUserCart(req, res);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
// Add to cart (supports both productId and designId)
exports.addToCartDesignOrProduct = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, product_id, designId, design_id, quantity = 1, description = null } = req.body;
    const prodId = productId || product_id;
    const desId = designId || design_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!prodId && !desId) return res.status(400).json({ error: 'No product or design specified' });

    // Find or create active cart
    let [cartRows] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
    let cartId;
    if (cartRows.length === 0) {
      const [result] = await pool.query('INSERT INTO carts (user_id, status) VALUES (?, "active")', [userId]);
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    if (prodId) {
      // Check product exists and is in stock
      const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [prodId]);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.stock < quantity) return res.status(400).json({ error: 'Not enough stock' });
      // Check if item already in cart
      const [[existingItem]] = await pool.query('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, prodId]);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        await pool.query('UPDATE cart_items SET quantity = ?, description = ? WHERE id = ?', [newQty, description, existingItem.id]);
      } else {
        await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity, description) VALUES (?, ?, ?, ?)', [cartId, prodId, Math.min(quantity, product.stock), description]);
      }
    } else if (desId) {
      // Check design exists
      const [[design]] = await pool.query('SELECT * FROM designs WHERE id = ?', [desId]);
      if (!design) return res.status(404).json({ error: 'Design not found' });
      // Check if design already in cart
      const [[existingItem]] = await pool.query('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND design_id = ?', [cartId, desId]);
      if (existingItem) {
        await pool.query('UPDATE cart_items SET quantity = ?, description = ? WHERE id = ?', [existingItem.quantity + quantity, description, existingItem.id]);
      } else {
        await pool.query('INSERT INTO cart_items (cart_id, design_id, quantity, description) VALUES (?, ?, ?, ?)', [cartId, desId, quantity, description]);
      }
    }
    // Return updated cart
    return exports.getUserCart(req, res);
  } catch (err) {
    console.error('Add to cart (product/design) error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a review
exports.addReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const productId = req.params.id;
    const { comment } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!comment) return res.status(400).json({ error: 'Comment required' });
    await pool.query('INSERT INTO reviews (user_id, product_id, comment) VALUES (?, ?, ?)', [userId, productId, comment]);
    res.json({ success: true });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all products with like counts and user like status
exports.getProductsWithLikes = async (req, res) => {
  try {
    const userId = req.user?.id;
    const [products] = await pool.query('SELECT * FROM products');
    for (const product of products) {
      const [likeCountRows] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE product_id = ?', [product.id]);
      product.likeCount = likeCountRows[0].count;
      if (userId) {
        const [userLikeRows] = await pool.query('SELECT 1 FROM likes WHERE product_id = ? AND user_id = ?', [product.id, userId]);
        product.userLiked = userLikeRows.length > 0;
      } else {
        product.userLiked = false;
      }
    }
    res.json({ products });
  } catch (err) {
    console.error('Get products with likes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's cart items (to check if product or design is in cart)
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    let [cartRows] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
    let cartId;
    if (cartRows.length === 0) {
      // Create a new active cart for the user if none exists
      const [result] = await pool.query('INSERT INTO carts (user_id, status) VALUES (?, "active")', [userId]);
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }
    // Get both product and design cart items
    const [cartItems] = await pool.query(`
      SELECT ci.id, ci.product_id, NULL as design_id, ci.quantity, ci.description, p.name, p.price, 
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id ASC LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      UNION ALL
      SELECT ci.id, NULL as product_id, ci.design_id, ci.quantity, ci.description, d.name as name, d.price, d.image_url
      FROM cart_items ci
      JOIN designs d ON ci.design_id = d.id
      WHERE ci.cart_id = ?
    `, [cartId, cartId]);
    // If no items, return empty array
    res.json({ cartItems: cartItems || [] });
  } catch (err) {
    console.error('Get user cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update cart item quantity and description
exports.updateCartQuantity = async (req, res) => {
  console.log('[updateCartQuantity] called', { params: req.params, body: req.body, user: req.user });
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;
    const { quantity, description = null } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });
    const [cartRows] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
    if (cartRows.length === 0) {
      console.log('[updateCartQuantity] No active cart for user', userId);
      return res.status(404).json({ error: 'Cart not found' });
    }
    const cartId = cartRows[0].id;
    console.log('[updateCartQuantity] userId:', userId, 'cartId:', cartId, 'cartItemId:', cartItemId);
    const [[cartItem]] = await pool.query('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cartId]);
    if (!cartItem) {
      console.log('[updateCartQuantity] Cart item not found for cartId:', cartId, 'cartItemId:', cartItemId);
      return res.status(404).json({ error: 'Cart item not found' });
    }
    // If product, check stock
    if (cartItem.product_id) {
      const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [cartItem.product_id]);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.stock < quantity) return res.status(400).json({ error: 'Not enough stock' });
    }
    // Debug logs
    console.log('[updateCartQuantity] cartItemId:', cartItemId, 'cartId:', cartId, 'quantity:', quantity, 'description:', description);
    const [updateResult] = await pool.query('UPDATE cart_items SET quantity = ?, description = ? WHERE id = ?', [quantity, description, cartItemId]);
    console.log('[updateCartQuantity] updateResult:', updateResult);
    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ error: 'Failed to update cart item quantity.' });
    }
    // Return updated cart
    return exports.getUserCart(req, res);
  } catch (err) {
    console.error('Update cart quantity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [cartRows] = await pool.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
    if (cartRows.length === 0) {
      console.log('[removeFromCart] No active cart for user', userId);
      return res.status(404).json({ error: 'Cart not found' });
    }
    const cartId = cartRows[0].id;
    console.log('[removeFromCart] userId:', userId, 'cartId:', cartId, 'cartItemId:', cartItemId);
    const [[cartItem]] = await pool.query('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cartId]);
    if (!cartItem) {
      console.log('[removeFromCart] Cart item not found for cartId:', cartId, 'cartItemId:', cartItemId);
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const [deleteResult] = await pool.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
    console.log('[removeFromCart] deleteResult:', deleteResult);
    // Return updated cart
    const [cartItems] = await pool.query(`
      SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, 
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id ASC LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);
    res.json({ success: true, cartItems });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Checkout order: move cart items to orders, store all form details
exports.checkoutOrder = async (req, res) => {
  let connection;
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const {
      recipient_name, phone, email, notes,
      shipping_address, payment_method
    } = req.body;
    // Validate required fields
    if (!recipient_name || !phone || !email || !shipping_address || !payment_method) {
      return res.status(400).json({ error: 'All checkout fields are required.' });
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();
    // Get active cart
    const [cartRows] = await connection.query('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [userId]);
    if (cartRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No active cart' });
    }
    const cartId = cartRows[0].id;
    // Get cart items with price
    const [cartItems] = await connection.query(
      'SELECT ci.product_id, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cartId]
    );
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }
    // Calculate total
    const total_amount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Print ENUM definition for status
    const [enumRows] = await connection.query("SHOW COLUMNS FROM orders WHERE Field = 'status'");
    console.log('ORDERS STATUS ENUM:', enumRows[0].Type);
    // Debug log for order insert parameters (full, correct order)
    console.log('ORDER INSERT PARAMS:', [userId, total_amount, 'pending', payment_method, shipping_address, recipient_name, phone, email, notes]);
    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address, recipient_name, phone, email, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, total_amount, 'pending', payment_method, shipping_address, recipient_name, phone, email, notes]
    );
    const orderId = orderResult.insertId;
    // Insert order items
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    // Clear the cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    // Mark cart as completed
    await connection.query('UPDATE carts SET status = "ordered" WHERE id = ?', [cartId]);
    await connection.commit();
    res.status(201).json({ orderId, total_amount });
  } catch (err) {
    if (connection) try { await connection.rollback(); } catch (e) {}
    // Print full error object
    console.error('Checkout order error:', err);
    res.status(500).json({ error: 'Server error', details: err });
  } finally {
    if (connection) try { connection.release(); } catch (e) {}
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.user_id, u.username, o.total_amount, o.status, o.payment_method, o.shipping_address, o.placed_at, o.recipient_name, o.phone, o.email, o.notes
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.placed_at DESC`
    );
    res.json({ orders });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single order with items
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const [[order]] = await pool.query(
      `SELECT o.*, u.username
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`, [orderId]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`, [orderId]
    );
    order.items = items;
    res.json({ order });
  } catch (err) {
    console.error('Get order by id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  // Only allow valid statuses
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
