const express = require('express');
const router = express.Router();
const RiskController = require('../controllers/riskController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/alerts', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), RiskController.getAlerts);
router.post('/resolve/:clientId', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), RiskController.resolveAlert);
router.post('/alerts/:alertId/resolve', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), RiskController.resolveAlert);

module.exports = router;
