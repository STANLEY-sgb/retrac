const express = require('express');
const router = express.Router();
const EmployerController = require('../controllers/employerController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', EmployerController.getEmployers);
router.get('/:id/dashboard', EmployerController.getEmployerDashboard);

module.exports = router;
