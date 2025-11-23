const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaintController');
const multer = require('multer');
const path = require('path');
const { authenticate, requireRole } = require('../middleware/auth');

// configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, unique + '-' + file.originalname.replace(/\s+/g, '-'));
	}
});
const upload = multer({ storage });

router.get('/', authenticate, requireRole('superadmin','admin'), controller.listComplaints);
router.get('/:id', authenticate, requireRole('superadmin','admin'), controller.getComplaint);
router.post('/', upload.single('file'), controller.createComplaint); // public
router.put('/:id/status', authenticate, requireRole('superadmin','admin'), controller.updateStatus);

module.exports = router;
