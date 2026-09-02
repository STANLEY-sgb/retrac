const express = require('express');
const router = express.Router();
const InterventionController = require('../controllers/interventionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', InterventionController.getInterventions);
router.post('/', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), InterventionController.recordIntervention);

module.exports = router;
