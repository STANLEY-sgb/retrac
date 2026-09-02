const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', DashboardController.getOverview);

module.exports = router;
