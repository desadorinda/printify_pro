// Auth routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, async (req, res) => {
  // Fetch full user info from DB for dashboard after refresh
  try {
    const [rows] = await require('../config/db').query('SELECT id, username, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.put('/update', auth, authController.updateUserInfo);

module.exports = router;
