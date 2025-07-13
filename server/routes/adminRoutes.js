// Admin registration route
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { upload } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', adminController.registerAdmin);

// Get all users (admin dashboard)
router.get('/users', adminController.getAllUsers);

// Get all collections
router.get('/collections', adminController.getAllCollections);
// Add collection
router.post('/collections', upload.single('image'), adminController.addCollection);
// Edit collection
router.put('/collections/:id', upload.single('image'), adminController.editCollection);
// Delete collection
router.delete('/collections/:id', adminController.deleteCollection);

// Get products by collection
router.get('/collections/:collectionId/products', adminController.getProductsByCollection);
// Add product (with images)
router.post('/products', upload.array('images', 5), adminController.addProduct);
// Edit product (with images)
router.put('/products/:id', upload.array('images', 5), adminController.editProduct);
// Delete product
router.delete('/products/:id', adminController.deleteProduct);
// Get product details
router.get('/products/:id', adminController.getProductDetails);
// Get likes for a product (optionally with user auth)
router.get('/products/:id/likes', adminController.getProductLikes);
// Get reviews for a product
router.get('/products/:id/reviews', adminController.getProductReviews);
// Get orders for a product
router.get('/products/:id/orders', adminController.getProductOrders);
// Like a product
router.post('/products/:id/like', authMiddleware, adminController.likeProduct);
// Unlike a product
router.delete('/products/:id/like', authMiddleware, adminController.unlikeProduct);
// Add to cart (supports both productId and designId)
router.post('/cart/add', authMiddleware, (req, res, next) => {
  console.log('POST /cart/add hit');
  next();
}, adminController.addToCartDesignOrProduct);
// Add a review
router.post('/products/:id/reviews', authMiddleware, adminController.addReview);
// Get all products with like counts and user like status
router.get('/products/with-likes', authMiddleware, adminController.getProductsWithLikes);
// Get user's cart items
router.get('/cart', authMiddleware, adminController.getUserCart);
// Update cart item quantity
router.put('/cart/item/:cartItemId', authMiddleware, adminController.updateCartQuantity);
// Remove item from cart
router.delete('/cart/item/:cartItemId', authMiddleware, adminController.removeFromCart);
// Checkout order
router.post('/checkout', authMiddleware, adminController.checkoutOrder);

// Get all orders
router.get('/orders', adminController.getAllOrders);
// Get order by ID
router.get('/orders/:orderId', adminController.getOrderById);
// Update order status by orderId
router.put('/orders/:orderId/status', adminController.updateOrderStatus);
// Get all reviews
router.get('/reviews', adminController.getAllReviews);
// Get admin dashboard stats
router.get('/stats', adminController.getAdminStats);
// Get all custom design requests
router.get('/custom-design-requests', authMiddleware, adminController.getAllCustomDesignRequests);

// --- OUTLINE COLLECTION ROUTES (MONGOOSE) ---
router.get('/outlines', adminController.getAllOutlines);
router.post('/outlines', upload.single('image'), adminController.addOutline);
router.put('/outlines/:id', upload.single('image'), adminController.editOutline);
router.delete('/outlines/:id', adminController.deleteOutline);
// Add design to outline
router.post('/outlines/:outlineId/designs', upload.single('image'), adminController.addDesignToOutline);
// Get all designs for a specific outline
router.get('/outlines/:outlineId/designs', adminController.getDesignsByOutline);
// Delete a design by id
router.delete('/designs/:id', adminController.deleteDesignById);
// Update a design by id
router.put('/designs/:id', upload.single('image'), adminController.updateDesignById);

// Contact/Message route
router.post('/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // You can save to DB here, or just log for now
    console.log('[Contact] New message:', { name, email, message });
    // Respond success
    res.json({ success: true, message: 'Message received. Thank you!' });
  } catch (err) {
    console.error('[Contact] Error saving message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
