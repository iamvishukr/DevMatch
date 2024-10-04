const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { populate } = require("../models/user");
const User = require("../models/user");
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

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    //User should see all the user cards except
    //1. His own card
    //2. his connections
    //3. ignored cards
    //4. already sent connection request (interested request)

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;      //pagination
    let limit = parseInt(req.query.limit) || 10;   //pagination
    limit = limit>50 ? 50 : limit ;         
    const skip = (page-1)*limit;
    //find all the connections requests (sent + received)
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set(); // creates array || set of users with no duplicates
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });
    //console.log(hideUsersFromFeed); // users i don't want to see on my feed,(including myself)

    const users = await User.find({
      //finding all the users from db whose id is not in hideUsersFromFeed array
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, //not include: user cards from hide user
        { _id: { $ne: loggedInUser._id } }, //not equal : my card (loggedInUser)
      ],
    }).select(USER_SAFE_DATA).skip(skip).limit(limit);

    res.send(users);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = userRouter;
