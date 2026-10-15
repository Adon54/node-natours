const express = require('express');
const bookingController = require('./../controller/bookingController');
const authController = require('./../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get(
    '/checkout-session/:tourId/:date',
    bookingController.getCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking)

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

module.exports = router;

/*
const tourId = req.params


*/
