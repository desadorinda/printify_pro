// Sample user routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const { upload } = require('../controllers/adminController');

router.get('/', userController.getUsers);
router.get('/stats', auth, userController.getUserStats);
router.get('/liked-products', auth, userController.getUserLikedProducts);
router.get('/orders', auth, userController.getUserOrders);
router.get('/orders/:orderId/items', auth, userController.getOrderItems);
router.post('/reviews', auth, userController.addReview);
router.get('/reviews/:productId', userController.getProductReviews);
router.get('/reviews', auth, userController.getUserReviews);
router.post('/custom-design-request', upload.single('referenceImage'), userController.addCustomDesignRequest);

module.exports = router;
