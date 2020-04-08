// Third Party Modules
const router = require('express').Router();

// Custom Module Files
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword
} = require('../controllers/auth');
const { protect } = require('../middlewares/authenticate');

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.put('/updateDetails', protect, updateDetails);
router.put('/updatePassword', protect, updatePassword);
// Export Router
module.exports = router;