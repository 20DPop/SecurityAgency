const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getUserProfile, createUser, getUsersByRole, createAdminAccount } = require('../controllers/user.controller');


router.post('/create', protect, authorize('admin', 'administrator'), createUser);
router.get('/list/:role', protect, authorize('admin', 'administrator'), getUsersByRole);
router.post(
  '/create-admin',
  protect,
  authorize('administrator'), 
);


module.exports = router;