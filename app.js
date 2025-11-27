import express from "express";
import feedRoutes from "./routes/feed.js";
import authRoutes from "./routes/auth.js";
import { connectDb } from "./util/db.js";
import path from "path";
import multer from "multer";

const app = express();

app.use("/images", express.static(path.join(process.cwd(), "images")));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"),
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    ),
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    ),
    next();
});

try {
  await connectDb();
} catch (err) {
  console.error("Failed to start server:", err);
}
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.listen(8080, () => {
  console.log("Server running");
});
