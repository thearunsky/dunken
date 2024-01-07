const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");


// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });

})

// get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});


// get login user Order
exports.myOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.find({ user: req.user._id })

    // if (!order) {
    //   return next(new ErrorHander("Order not found with this Id", 404));
    // }

    res.status(200).json({
        success: true,
        order,
    });
});

// get all orders - Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()


    let totalAmount = 0

    orders.forEach((ord) => {
        totalAmount += ord.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});


// Update orders - Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {

    // We will find perticular order by their id
    const order = await Order.findById(req.params.id)

    
    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }


    // You can not update order if it is deliverd
    if (order.orderStatus === "Delivered") {
        return next(new ErrorHander("You have delivered this order", 400))
    }

    // It will change stock of product when someone order a product
    order.orderItems.forEach(async order => {
        await updateStock(order.product, order.quantity)
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now()
    }


    await order.save({
        validateBeforeSave: false
    })

    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {

    const product = await Product.findById(id)

    product.stock -= quantity;

    await product.save({
        validateBeforeSave: false
    })
}


// Delete orders - Admin
exports.deleteOrders = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    await order.deleteOne()

    res.status(200).json({
        success: true
    });
});
