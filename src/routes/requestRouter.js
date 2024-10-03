const express = require("express");
const { adminAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  adminAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request already exist" });
      }
      const toUser = await User.findById(toUserId); ///it will find if user exist in db
      if (!toUser) {
        return res
          .status(404)
          .json({ message: "User not found", user: toUserId });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      // if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
      //   return res.status(400).json({message: "Invalid, Can't send request to yourself"})
      // }

      const data = await connectionRequest.save();

      if (status === "interested") {
        res.json({
          message: req.user.firstName + " is interested " + req.toUser.firstName,
          data,
        });
      } else {
        // If the status is "ignored", no need to send a specific message
        res.json({
          message: "Request status updated",
          data,
        });
      }
    } catch (error) {
      res.status(400).send("Error sending request " + error.message);
    }
  }
);

module.exports = requestRouter;
