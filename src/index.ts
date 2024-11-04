import dotenv from "dotenv";
import connectDB from "./db";
import { app } from "./app/app";
// const dotenv = require('dotenv')

dotenv.config()

const port = process.env.PORT || 8000;

// db connect
connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log("Server is running at port:", port)
    });
})
.catch((err)=>{
    console.log("Mongo db connection failed!", err)
})