const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";


    // Wrong Mongodb Id error
    if (err.name === "CastError") {
      const message = `ID is not valid. Invalid: ${err.path}`;
      err = new ErrorHandler(message, 400);
    }

      // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    messagek: err.message,
  });


};