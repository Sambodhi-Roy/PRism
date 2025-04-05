import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import {clerkMiddleware} from "@clerk/express";
import { authRouter } from "./routes/auth.route.js";
dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
 
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(clerkMiddleware());

//authentication routes
app.use("/auth",authRouter)

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
  connectDB();
});
