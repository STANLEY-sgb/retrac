const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/healthController');

router.get('/', HealthController.getHealth);

module.exports = router;
