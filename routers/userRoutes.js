const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController')
const bookingController = require('./../controller/bookingController')


const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware 
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser)
router.patch(
    '/updateMe', 
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);

router.get(
    '/:userId/reviews', 
    authController.restrictTo('user', 'admin'), 
    reviewController.getAllReviews
);
router.get(
    '/:userId/bookings', 
    authController.restrictTo('user', 'admin'), 
    bookingController.getAllBooking
);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getallUsers)
    .post(userController.createUser); 
    
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
