const express = require('express');
const router = express.Router();
const JobController = require('../controllers/jobController');
const ApplicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', JobController.getJobs);
router.post('/', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), JobController.createJob);
router.get('/:id', JobController.getJobById);
router.put('/:id', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), JobController.updateJob);
router.post('/:id/apply', requireRole(ROLES.ADMIN, ROLES.CASEWORKER, ROLES.EMPLOYER), ApplicationController.applyForJob);

module.exports = router;
