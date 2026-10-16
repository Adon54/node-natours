const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.alerts = (req, res, next) => {
  const {alert} = req.query

  if (alert === 'booking') {
    res.locals.alert = 'Your booking was successfull. Please check your email for confirmation. If you\'re booking doesn\'t show up here immediately, please come back later.'
  }

  next()
}

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that tamplate using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'reviews',
      fields: 'review rating user',
    })
    .populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  let booked = false;
  let userReview = null;

  if (res.locals.user) {
    // Check if the user has booked the tour
    const booking = await Booking.findOne({
      user: res.locals.user.id,
      tour: tour.id
    });

    booked = !!booking;

    // Check if the user has reviewed the tour
    userReview = await Review.findOne({
      user: res.locals.user.id,
      tour: tour.id
    });
  }

  res.render('tour', {
    title: `${tour.name} Tour`,
    tour,
    booked,
    userReview
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Find all reviews
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'imageCover name startLocation slug',
  });

  res.status(200).render('my_reviews', {
    title: 'My Reviews',
    reviews,
  });
});

exports.updateUserData = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
};
