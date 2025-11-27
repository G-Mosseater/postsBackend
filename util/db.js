import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("./.env") });
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

export async function connectDb() {
  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error(err);
  }
}
