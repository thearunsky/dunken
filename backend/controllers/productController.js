const catchAsyncError = require("../middleware/catchAsyncError")
const Product = require("../models/productModel")
const ApiFeatures = require("../utils/apiFeaters")

// When product not found
const ErrorHander = require("../utils/errorhandler")


exports.createProduct = async (req, res, next) => {


    // Using try and catch so that server never shut down if you miss something during creation of a product
    try {

        req.body.user = req.user.id

        const product = await Product.create(req.body)

        res.status(201).json({
            success: true,
            product
        })

    } catch (error) {
        return res.status(500).json({ success: false, error })
    }
}

exports.getAllProducts = async (req, res) => {

    const resultPerPage = 8
    const productCount = await Product.countDocuments()

    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage)
    const products = await apiFeature.query;

    res.status(200).json({ success: true, products, productCount })
}
exports.getProductDetails = async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    await Product.findOne(product)
    res.status(200).json({ success: true, product })
}

exports.updateProduct = async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
}

exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    await Product.deleteOne(product)
    res.status(200).json({ success: true, message: "Product deleted succefully" })
}

// Create new review or update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {


    const { rating, comment, productId } = req.body

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()

    )

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating
                rev.comment = comment
            }
        })


    } else {

        product.reviews.push(review)
        product.numOfReviews = product.reviews.length


    }

    let avg = 0
    product.reviews.forEach((rev) => {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length

    await product.save({
        validateBeforeSave: false
    })

    res.status(200).json({
        success: true
    })


})


//Get all reviews of single product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
});


// Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });