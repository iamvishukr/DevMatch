const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const validator = require("validator");
const User = require("../models/user");

const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //always do validations and encryption first
    validateSignUpData(req);

    //encrypting password using bcrypt
    const { firstName, lastName, emailId, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10); //10 is salt - safety level kinda thing

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

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid Credentials");
    }
    const user = await User.findOne({ emailId: emailId }); ///it will find if email exist in db

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT(); //coming from User model

      res.cookie("token", token, {
        expires: new Date(Date.now() + 168 * 3600000), // cookie will be removed after 7 days
      });
      res.send("Login success!");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("Error " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  
  res.cookie("token", null , {
    expires: new Date(Date.now()), 
  });
  res.send("Logged Out");
});

module.exports = authRouter;
