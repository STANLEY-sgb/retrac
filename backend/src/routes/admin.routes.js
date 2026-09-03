const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.toggleUserStatus);
router.patch('/users/:id', AdminController.toggleUserStatus);
router.put('/users/:id/status', AdminController.toggleUserStatus);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.get('/caseworkers', AdminController.getCaseworkers);
router.post('/caseworkers', AdminController.createCaseworker);
router.put('/caseworkers/:id', AdminController.updateCaseworker);
router.patch('/caseworkers/:id', AdminController.updateCaseworker);
router.put('/caseworkers/:id/status', AdminController.toggleCaseworkerStatus);
router.patch('/caseworkers/:id/status', AdminController.toggleCaseworkerStatus);
router.put('/clients/:id/assign', AdminController.assignClient);
router.post('/assign-client', AdminController.assignClient);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSetting);

module.exports = router;
