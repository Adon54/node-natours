const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel'); 
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const { tourId, date } = req.params;
    const userId = req.user.id;

    const [booked] = await Booking.find({ tour: tourId, user: userId })
    if (booked) {
        return next(new AppError('You have already booked the tour', 400))
    }
    const tour = await Tour.findById(tourId);

    const selectedDate = tour.startDates.find(obj => new Date(obj.date).getTime() === new Date(date).getTime())

    if (selectedDate.participants === tour.maxGroupSize) {
        return next(new AppError('Tour soldout on the selected date', 409));
    }

    // 2) Create checkout session
    // const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${tourId}&user=${req.user.id}&date=${date}&price=${tour.price}`,
    //     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    //     customer_email: req.user.email,
    //     client_reference_id: tourId,
    //     line_items: [
    //         {
    //             name: `${tour.name} Tour`,
    //             description: tour.summary,
    //             images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    //             amount: tour.price * 100,
    //             currency: 'usd', 
    //             quantity: 1
    //         }
    //     ]
    // })
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',

        client_reference_id: tourId,
        customer_email: req.user.email,

        metadata: {
            user: userId,
            date,
            price: tour.price
        },

        line_items: [{
            price_data: {
                currency: 'usd',
                unit_amount: tour.price * 100,

                product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`]
                }
            },

            quantity: 1
        }],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`
    })

    // 3) Create sessions as response
    res.status(200).json({
        status: 'success',
        session
    })
})

// exports.createBookingCheckout = async (req, res, next) => {
//     // This is only TEMPORARY, because it's INSECURE: everyone can make bookings without paying
//     const {tour, user, date, price} = req.query;

//     if(!tour && !date && !user && !price) return next();
    
//     await Booking.create({tour, date, user, price});
//     await Tour.updateOne({ "_id": tour, "startDates.date": date }, { $inc: { "startDates.$.participants": 1 } });

//     res.redirect(req.originalUrl.split('?')[0]); 
// }

const createBookingCheckout = async session => {
    const tour = session.client_reference_id

    const {user, date, price} = session.metadata.date

    await Tour.updateOne({ "_id": tour, "startDates.date": date }, { $inc: { "startDates.$.participants": 1 } });

    console.log(user, date, price, session.metadata)
    await Booking.create({tour, date, user, price})
}

exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature']
    
    let event 
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object)
    }

    res.status(200).send({received: true})
}

exports.createBooking = factory.createOne(Booking);

exports.getBooking = factory.getOne(Booking);

exports.getAllBooking = factory.getAll(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
