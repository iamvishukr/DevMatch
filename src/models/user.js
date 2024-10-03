const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    ///schemas for user
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 16,
      trim: true, // New
      match: /^[a-zA-Z]+$/,
    },
    lastName: {
      type: String,
      trim: true, // New
      match: /^[a-zA-Z]+$/,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password: " + value);
        }
      },
    },
    newPassword: {
      type: String,
      required: false,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password: " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      validate(value) {
        if (!Number.isInteger(value)) {
          throw new Error("Invalid Age");
        }
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type.`
      },
      // validate(value) {
      //   if (!["male", "female", "other"].includes(value)) {
      //     throw new Error("Invalid Gender value");
      //   }
      // },
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "Hey there, Let's Connect and code together?",
      maxLength: 200,
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this; //mentioning a particular user
  const token = await jwt.sign({ _id: user._id.toString() }, "DEV@MATCH$23", {
    expiresIn: "1d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser){
    const user = this; 
    const passwordHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}
const User = mongoose.model("User", userSchema); //model for user
module.exports = User;
