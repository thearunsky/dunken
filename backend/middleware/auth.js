const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// For user
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

  // It will request token from cookies
  const { token } = req.cookies;

  // If token not found
  if (!token) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }

  // If token found and it will varify
  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});

// For host
exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
           return next(new ErrorHander(`Role ${req.user.role} is not allowed to access this resoure`,403))
        }
        next()
    }
}