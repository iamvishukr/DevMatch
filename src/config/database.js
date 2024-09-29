const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://iamvishukr:dev%408434@devmatch.d1o6w.mongodb.net/DevMatch"
  );
};

module.exports = connectDB;