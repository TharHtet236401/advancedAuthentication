import express from "express";
import dotenv from "dotenv";
import { connectMongoDb } from "./config/connectMongoDb.js";
import authRoute from "./routes/auth.route.js";
dotenv.config();



const app = express();
app.use(express.json());

app.use("/api/auth", authRoute);



app.listen(process.env.PORT, () => {
  connectMongoDb();
  console.log(`Server is running on port ${process.env.PORT}`);
});

