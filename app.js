const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const bookingRouter = require('./routers/bookingRoutes');
const bookingController = require('./controller/bookingController');
const viewRouter = require('./routers/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use('/', express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,
//     crossOriginOpenerPolicy: false,
//     crossOriginResourcePolicy: false,

//     contentSecurityPolicy: {
//       directives: {
//         scriptSrc: ["'self'", 'https://js.stripe.com'],
//         frameSrc: ["'self'", 'https://js.stripe.com'],
//         connectSrc: ["'self'", 'https://api.stripe.com'],
//       },
//     },
//   })
// );

// app.use(helmet())

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://api.mapbox.com",
        ],
        workerSrc: ["'self'", "blob:"],
        frameSrc: [
          "'self'",
          "https://js.stripe.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://api.mapbox.com",
          "https://events.mapbox.com"
        ],
      },
    },
  })
);

// Development logging
if (process.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requrest from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout', 
  express.raw({type: 'application/json'}), 
  bookingController.webhookCheckout
)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross site script)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression())

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(404).end();
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
