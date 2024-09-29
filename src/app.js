const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { adminAuth } = require("./middlewares/auth");

app.use(express.json());  //middleware used for JSON serialization (//json to javascript object)
app.post("/signup", async (req, res) => {

  //creating a new user (new instance) of the User model
  const user = new User(req.body);
  try {
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error creating user: " + err.message);
  }
});

//getting one user from the database
app.get("/user", async (req, res) => {
  try {
    const users = await User.find({emailId: req.body.emailId})
  if(users.length ===0){
    res.status(404).send("User not found");
  }else{
    res.send(users)
  }
  } catch (error) {
    res.status(400).send("Something went wrong")
  }
})

//getting all users from the database (/feed)

app.get("/feed", async (req, res)=>{
  try {
    const allUsers = await User.find({})
    res.send(allUsers);
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
})

//delete one user from the database by id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findOneAndDelete(userId);
    res.send("User Deleted Successfully")
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
})

//update user info
app.patch("/user", async (req, res)=>{
  
})

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(3001, () => {
      console.log("app is listening on port 3001");
    });
  })
  .catch((error) => console.error("Database connection failed", error));
