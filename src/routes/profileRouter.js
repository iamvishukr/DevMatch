const express = require("express");
const { adminAuth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");

const {
  validateEditProfileData,
  passwordValidation,
} = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", adminAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Something went wrong" + error.message);
  }
});

profileRouter.patch("/profile/edit", adminAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Can't edit this field");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key])); //edit logic
    await loggedInUser.save();
    res.json({
      message: `Hey ${loggedInUser.firstName}, your profile has been updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("Something went wrong " + error.message);
  }
});
profileRouter.patch("/profile/changePassword", adminAuth, async (req, res) => {
  try {
    if (!passwordValidation(req)) {
      throw new Error("Can't edit this field");
    }
    const loggedInUser = req.user;
    const { password, newPassword } = req.body;
    const isPasswordConfirmed = await bcrypt.compare(password, loggedInUser.password);
    if (!isPasswordConfirmed) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();
    res.json({
      message: `Hey ${loggedInUser.firstName}, your password was updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("Something went wrong " + error.message);
  }
});

module.exports = profileRouter;
