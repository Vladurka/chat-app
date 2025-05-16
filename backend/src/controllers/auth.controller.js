import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { email, fullname, password } = req.body;
  try {
    if (password.length < 6) {
      return res
        .status(400)
        .send("Password should be at least 6 characters long");
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).send("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      fullname,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({ user: newUser });
    } else {
      res.status(400).send("Invalid user data");
    }
  } catch (err) {
    console.log("Error creating user:", err);
    res.status(500).send("Internal Server Error");
  }
};
export const login = (req, res) => {
  res.send("login");
};
export const logout = (req, res) => {
  res.send("logout");
};
