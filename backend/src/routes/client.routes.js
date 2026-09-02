const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticateToken);

router.get('/', ClientController.getClients);
router.post('/', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), ClientController.createClient);
router.get('/:id', ClientController.getClientById);
router.put('/:id', requireRole(ROLES.ADMIN, ROLES.CASEWORKER), ClientController.updateClient);
router.get('/:id/matches', ClientController.getMatches);

module.exports = router;
