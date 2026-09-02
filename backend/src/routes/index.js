const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const clientRoutes = require('./client.routes');
const checkinRoutes = require('./checkin.routes');
const riskRoutes = require('./risk.routes');
const interventionRoutes = require('./intervention.routes');
const jobRoutes = require('./job.routes');
const applicationRoutes = require('./application.routes');
const employerRoutes = require('./employer.routes');
const paymentRoutes = require('./payment.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');
const webhookRoutes = require('./webhook.routes');
const demoRoutes = require('./demo.routes');
const healthRoutes = require('./health.routes');

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/checkins', checkinRoutes);
router.use('/risk', riskRoutes);
router.use('/interventions', interventionRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/employers', employerRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/webhook', webhookRoutes);
router.use('/demo', demoRoutes);
router.use('/health', healthRoutes);

module.exports = router;
