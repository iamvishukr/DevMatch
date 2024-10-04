const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { populate } = require("../models/user");
userRouter = express.Router();

//get all the pending connection request for loggedIn user
const USER_SAFE_DATA = "firstName lastName photoUrl about skills age"; //ref:User
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "about",
      "skills",
      "age",
    ]);
    res.json({ message: "Data fetched successfully", data: connectionRequest });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ message: "Data fetched successfully", data });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = userRouter;
