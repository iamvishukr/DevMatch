const express = require('express');

const app = express();

app.use("/hello",(req, res)=>{
    res.send("Hello, world!");
})

app.listen(3001, ()=>{
   console.log("app is listening on port 3001")});