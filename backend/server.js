const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({path:"backend/config/config.env"})

// Handling Uncaught Exception
// When you are using a varible which is not defined
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
  });


// Connecting to DATABASE
require("./config/database")



app.listen(process.env.PORT,()=>{
    console.log("Server is working on",process.env.PORT);
});

// Unhandled Promise Rejection
// when you put wrong url of mongodb
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  
    server.close(() => {
      process.exit(1);
    });
});