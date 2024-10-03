const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
app.use(express.json()); 
app.use(cookieParser());

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)



connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(3001, () => {
      console.log("app is listening on port 3001");
    });
  })
  .catch((error) => console.error("Database connection failed", error));
