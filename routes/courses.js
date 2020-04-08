// Third Party Modules
const router = require('express').Router({ mergeParams: true });

// Custom Module Files
const {
    getCourse,
    getCourses,
    updateCourse,
    deleteCourse,
    addCourse
} = require('../controllers/courses');

const Course = require('../models/Course');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/authenticate');
// Routes

router
    .route('/')
    .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);


// Export Router
module.exports = router;