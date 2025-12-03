import User from "../models/user.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("./.env") });

export const signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, endered data is incorrect",
      errors: errors.array(),
    });
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name: name,
    });
    const result = await user.save();

    res.status(201).json({ message: "User Created!", userId: result._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not create user", error: error.message });
  }
};

export const login = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  let loadedUser;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    loadedUser = user;
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      return res.status(401).json({ message: "Wrong password!" });
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(201).json({ token: token, userId: loadedUser._id.toString() });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not log in!", error: error.message });
  }
};

export const getUserStatus = async (req, res) => {
  try {
    const user = User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ status: user.status });
  } catch (error) {}
};

export const updateUserStatus = async (req, res) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: "Status updated" });
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
};
