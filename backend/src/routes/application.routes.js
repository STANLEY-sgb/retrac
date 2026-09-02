const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.put('/:id/status', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), ApplicationController.updateStatus);
router.patch('/:id/status', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), ApplicationController.updateStatus);
router.put('/:id', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), ApplicationController.updateStatus);
router.patch('/:id', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), ApplicationController.updateStatus);

module.exports = router;
