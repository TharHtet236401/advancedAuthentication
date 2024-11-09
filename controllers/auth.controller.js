import { User } from "../models/auth.model.js";

export const signIn = async (req, res) => {
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
  } catch (error) {
    console.log(error);
  }
};

export const signUp = async (req, res) => {
  res.send("signUp");
};

export const logout = async (req, res) => {
  res.send("logout");
};
