class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// Important Notes ***
/*
Error.captureStackTrace(this, this.constructor):

this: It refers to the current instance of the AppError object being created.
Error.captureStackTrace(target, constructorOpt): This is a method available on the Error class. It captures a stack trace (a list of 
function calls that led to the error's creation) and stores it in the stack property of the target object (this).

this.constructor: It provides the constructor of the AppError class itself as the second argument to captureStackTrace. This ensures that 
the stack trace starts from where the AppError was instantiated, rather than from within the Error class's methods.

Purpose:

Capturing the stack trace is crucial for debugging because it provides valuable context about where the error originated in your code, 
making it easier to trace the problem's source. When an AppError object is constructed:

It inherits properties and methods from the Error class.
The constructor runs, capturing the stack trace and storing it in the object's this.stack property.
The captured stack trace can be accessed later for debugging or error logging purposes.
*/
