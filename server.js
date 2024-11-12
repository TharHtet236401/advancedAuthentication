import express from "express";
import dotenv from "dotenv";
import { connectMongoDb } from "./config/connectMongoDb.js";
import authRouter from "./routes/auth.route.js";
dotenv.config();



const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(process.env.PORT, () => {
  connectMongoDb();
  console.log(`Server is running on port ${process.env.PORT}`);
});

