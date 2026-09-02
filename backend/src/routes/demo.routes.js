const express = require('express');
const router = express.Router();
const DemoController = require('../controllers/demoController');
const { authenticateToken } = require('../middleware/auth');

// Demo SMS simulator exercises real backend pipeline
router.post('/sms', DemoController.simulateSms);
router.post('/payment', authenticateToken, DemoController.simulatePayment);
router.post('/reset', DemoController.resetDemoState);

module.exports = router;
