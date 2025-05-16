import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

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
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");
    generateToken(user._id, res);
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error logging in:", error);
    res.status(500).send("Internal Server Error");
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error logging out:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;
  try {
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).send("Profile picture is required");
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("Error checking authentication:", error);
    res.status(500).send("Internal Server Error");
  }
};
