import { User } from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/email.js";

export const signUp = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    console.log(verificationToken);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    await newUser.save();
    generateTokenAndSetCookie(res, newUser._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { ...newUser._doc, password: undefined },
    });
  } catch (error) {
    console.log(error);
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
    // console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
  }
};

// };

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetPasswordTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `http://localhost:3000/reset-password/${resetPasswordToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token or token expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    await sendResetSuccessEmail(user.email);
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
