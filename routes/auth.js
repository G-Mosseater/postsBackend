import express from "express";
import { body } from "express-validator";
import User from "../models/user.js";
import {
  getUserStatus,
  login,
  signUp,
  updateUserStatus,
} from "../controllers/auth.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          return Promise.reject("Email already in use!");
        }
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be atleast 5 characters long!"),
    body("name").trim().not().isEmpty().withMessage("Name is required!"),
  ],
  signUp
);

router.post("/login", login);

router.get("/status", isAuth, getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  updateUserStatus
);

export default router;
