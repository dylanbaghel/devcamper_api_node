// Third Party Modules
const router = require('express').Router();

// Custom Module Files
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');

const User = require('../models/User');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/authenticate');
// Routes
router.use(protect);
router.use(authorize('admin'));
router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


// Export Router
module.exports = router;