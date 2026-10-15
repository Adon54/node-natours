const Review = require('./../models/reviewModel');
const Bookings = require('./../models/bookingModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.setTourUserIds = async (req, res, next) => {
    const tour = req.params.tourId || req.body.tour;
    const user = req.user.id || req.body.user;
    
    const reviewed = await Review.findOne({ tour, user });
    
    // Preventing a user from revieweing more than once
    if (reviewed) {
        return next(new AppError('You have already reviewed this tour', 400));
    }

    const booked = await Bookings.findOne({ tour, user });
    
    // Allow the user to review only the booked tour
    if (!booked) {
        return next(new AppError('Booke the tour to give it a review', 400));
    }

    // Organize body from nested route
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
