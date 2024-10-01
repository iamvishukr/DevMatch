const User = require("../models/user");
const jwt = require("jsonwebtoken");

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if(!token) {
      throw new Error(" Invalid token");
    }
    const decodedObj = jwt.verify(token, "DEV@MATCH$23");
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Bad Request" + err.message);
  }
};

module.exports = { adminAuth };
