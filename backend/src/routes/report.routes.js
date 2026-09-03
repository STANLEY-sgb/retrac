const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN, ROLES.CASEWORKER));

router.get('/', ReportController.getOverview);
router.get('/overview', ReportController.getOverview);
router.get('/export-csv', ReportController.exportCsv);

module.exports = router;
