const express = require("express");
const router = express.Router();

const { isAuthenticatedUser,authorizeRoles } = require("../middleware/auth");
const { newOrder, getSingleOrder, myOrder, getAllOrders, updateOrder, deleteOrders } = require("../controllers/orderController");

// User Routes
router.route("/order/new").post(isAuthenticatedUser,newOrder)

router.route("/orders/me").get(isAuthenticatedUser, myOrder);


// Admin Routes
router.route("/order/:id").get(isAuthenticatedUser,authorizeRoles("admin"), getSingleOrder);

router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles("admin"), getAllOrders);

router.route("/admin/order/:id")
    .put(isAuthenticatedUser,authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrders);

module.exports = router;