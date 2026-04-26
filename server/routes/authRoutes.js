const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, getProfile } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', require('../middleware/auth').protect, getProfile);

module.exports = router;
