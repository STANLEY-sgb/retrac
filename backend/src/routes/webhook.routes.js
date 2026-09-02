const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');

// Africa's Talking / Inbound SMS webhook (No JWT required - incoming gateway webhook)
router.post('/sms', WebhookController.handleIncomingSms);

module.exports = router;
