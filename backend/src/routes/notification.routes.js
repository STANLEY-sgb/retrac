const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', NotificationController.getNotifications);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);

module.exports = router;
