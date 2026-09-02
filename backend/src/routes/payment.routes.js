const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', PaymentController.getPayments);
router.post('/trigger', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), PaymentController.triggerPayment);

module.exports = router;
