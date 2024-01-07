const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")

const errorMiddleware = require("./middleware/error")

// In order to use req.body 
app.use(express.json())

app.use(cookieParser())

// Routes Imports
const product = require("./routes/productRoutes");
const user = require("./routes/userRoute")
const order = require("./routes/orderRoute")

app.use("/api/v1",product);
app.use("/api/v1",user)
app.use("/api/v1",order)


// Middlewware for error
app.use(errorMiddleware)

module.exports = app;