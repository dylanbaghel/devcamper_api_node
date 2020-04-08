// Third Party Modules
const router = require('express').Router({ mergeParams: true });

// Custom Module Files
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

const Review = require('../models/Review');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/authenticate');
// Routes
router
    .route('/')
    .get(advancedResults(Review, {
        path: 'bootcamp user',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('user', 'admin'), addReview);

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'),updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

// Export Router
module.exports = router;