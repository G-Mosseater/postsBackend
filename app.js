import express from "express";
import feedRoutes from "./routes/feed.js";
import authRoutes from "./routes/auth.js";
import { connectDb } from "./util/db.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import { Server } from "socket.io";
// import { init } from "./socket.js";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/schema.js";
import { root } from "./graphql/resolvers.js";
import { error } from "console";
import { isAuth } from "./middleware/auth.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(isAuth);

app.put("/post-image", (req, res, next) => {
  if (!isAuth) {
    throw new Error(" Not authenticated!");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occured";
      const code = err.originalError.code || 500;
      return {
        message: message,
        status: code,
        data: data,
      };
    },
  })
);

try {
  await connectDb();
} catch (err) {
  console.error("Failed to connect database:", err);
}
// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);

app.listen(8080);

// const io = init(server);
// io.on("connection", (socket) => {
//   console.log("socket connected");
// });

export const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
