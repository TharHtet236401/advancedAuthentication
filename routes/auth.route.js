import express from "express";
import {
  signIn,
  signUp,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.post("/logOut", logout);
router.post("/verifyEmail", verifyEmail);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);
export default router;
