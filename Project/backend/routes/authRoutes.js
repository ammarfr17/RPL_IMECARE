const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/login', controller.login);
// register a new admin — protected: must be admin or superadmin
router.post('/register', authenticate, requireRole('superadmin', 'admin'), controller.registerAdmin);

module.exports = router;
