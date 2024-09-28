const express = require("express");
const app = express();
const mongoose = require("mongoose");

const userRouter = require("./routes/user.js");

app.use("/user", userRouter);

app.listen(4000, () => {
    console.log("server is listening on port 4000");
});