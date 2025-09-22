const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  // Skip preflight requests
  if (req.method === "OPTIONS") return next();

  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Invalid token");

    const decoded = jwt.verify(token, "DEV@MATCH$23");
    const user = await User.findById(decoded._id);
    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized: " + err.message);
  }
};

module.exports = { userAuth };
