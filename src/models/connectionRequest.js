const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not a valid status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({fromUserId: 1, toUserId: 1})       //optimization for searching

connectionRequestSchema.pre("save", function (next) {       //mongoose pre method (using for validaion) 
  const connectionRequest = this;                      // so that user can't send request to themselves
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("can't send request to Yourself !!");
  }
  next();
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
