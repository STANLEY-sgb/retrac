const express = require('express');
const router = express.Router();
const CheckinController = require('../controllers/checkinController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', CheckinController.getCheckins);
router.post('/send', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), CheckinController.triggerBatchCheckins);
router.post('/send/:clientId', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), CheckinController.sendCheckinToClient);

module.exports = router;
