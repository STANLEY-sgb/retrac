const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', ReportController.getOverview);
router.get('/overview', ReportController.getOverview);
router.get('/export-csv', ReportController.exportCsv);

module.exports = router;
