const NotificationService = require('../services/notification/notificationService');

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user ? req.user.id : 'usr-cw-01';
      const unreadOnly = req.query.unreadOnly === 'true';
      const result = await NotificationService.getUserNotifications(userId, { unreadOnly });

      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : 'usr-cw-01';
      await NotificationService.markAsRead(id, userId);

      return res.json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user ? req.user.id : 'usr-cw-01';
      await NotificationService.markAllAsRead(userId);

      return res.json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
