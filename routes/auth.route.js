import express from "express";
import { signIn, signUp, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.post("/logOut", logout);

export default router;
