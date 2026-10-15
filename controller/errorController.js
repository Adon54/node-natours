const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = err => {
    const message = `Duplicate field value: '${err.keyValue.name}'. Please use another value`
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has been expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        // API 
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    } 

    // RENDER WEBSITE
    console.error('ERROR 💥', err);
    
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    })
}

const sendErrorProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })

            // Programming or other unknown error: don't leak error details
        }
    
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }


    // RENDER WEBSITE
    if(err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    } 

    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later'
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if(process.env.NODE_ENV === 'production') {
        if(err.name === 'CastError') err = handleCastErrorDB(err);
        if(err.name === 'MongoError') err = handleDuplicateFieldDB(err);
        if(err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if(err.name === 'JsonWebTokenError') err = handleJWTError();
        if(err.name === 'TokenExpiredError') err = handleJWTExpiredError();

        sendErrorProd(err, req, res);
    }
    // res.status(err.statusCode).json({
    //     err
    // })
}
