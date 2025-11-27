import { validationResult } from "express-validator";
import Post from "../models/post.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPosts = async (req, res) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Posts fetched succesfully",
      posts,
      totalItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts!", error: error.message });
  }
};

export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect",
      errors: errors.array(),
    });
  }
  if (!req.file) {
    return res.status(422).json({ message: "No file provided" });
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    creator: req.userId,
    imageUrl: imageUrl,
  });

  try {
    const savedPost = await post.save();
    console.log(savedPost);

    const user = await User.findById(req.userId);
    console.log(user);
    user.posts.push(savedPost._id);
    await user.save();

    res.status(201).json({
      message: "Post Saved!",
      post: savedPost,
      creator: { _id: user._id, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save post!", error: error.message });
  }
};

export const getPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post fetched", post });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Fetching post failed", error: error.message });
  }
};

export const updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed, endered data is incorrect",
      errors: errors.array(),
    });
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    return res.status(422).json({ message: "No file picked" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    if (req.file && imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    await post.save();

    res.status(200).json({ message: "Post updated", post: post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Not Authorized" });
    }
    if (post.imageUrl) {
      clearImage(post.imageUrl);
    }

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    console.log(user.posts);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
