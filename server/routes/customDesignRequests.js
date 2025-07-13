const express = require('express');
const router = express.Router();
const customDesignRequestsController = require('../controllers/customDesignRequestsController');

// POST /api/custom-design-requests
router.post('/', customDesignRequestsController.createCustomDesignRequest);

module.exports = router;
