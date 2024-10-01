const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {adminAuth} = require("./middlewares/auth");
app.use(express.json()); //middleware used for JSON serialization (//json to javascript object)
app.use(cookieParser());
//signup
app.post("/signup", async (req, res) => {
  try {
    //always do validations and encryption first

    //validating the signup data
    validateSignUpData(req);

    //encrypting password using bcrypt
    const { firstName, lastName, emailId, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10); //10 is salt - safety level kinda thing
    console.log(hashPassword);

    //creating a new user (new instance) of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });
    if (user.skills.length > 10) {
      throw new Error("Can't add more than 10 skills");
    }
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error creating user: " + err.message);
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Credentials");
    }
    const user = await User.findOne({ emailId: emailId }); ///it will find if email exist in db

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      //After validating email and password we will create cookies
      //create JWT token (JWT is stored inside the cookie)
      const token = await jwt.sign({ _id: user._id.toString() }, "DEV@MATCH$23", { expiresIn: "1d"});
      //Add the token to the cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 168 * 3600000) // cookie will be removed after 7 days
      });
      res.send("Login success!");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("Error " + error.message);
  }
});

app.get("/profile", adminAuth,  async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Something went wrong" + error.message);
  }
});

//getting one user from the database
app.get("/user", async (req, res) => {
  try {
    const users = await User.find({ emailId: req.body.emailId });
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

//getting all users from the database (/feed)
app.get("/feed", async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.send(allUsers);
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

//delete one user from the database by id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findOneAndDelete({ _id: userId });
    res.send("User Deleted Successfully");
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

//update user info
app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  try {
    const AllowedUpdates = [
      "userId",
      "firstName",
      "lastName",
      "photoUrl",
      "about",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(data).every((key) =>
      AllowedUpdates.includes(key)
    );
    if (!isUpdateAllowed) {
      throw new Error("Can't Update");
    }
    if (data.skills.length > 10) {
      throw new Error("Can't add more than 10 skills");
    }
    const user = await User.findOneAndUpdate({ _id: userId }, data, {
      runValidators: true, //option which will validate while updating user (using for gender)
    });
    res.send("User Updated Successfully");
  } catch (error) {
    res.status(400).send("Update Failed - " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(3001, () => {
      console.log("app is listening on port 3001");
    });
  })
  .catch((error) => console.error("Database connection failed", error));
