import { User } from "../models/user.model.js";
import { Directory } from "../models/directory.model.js";
import mongoose, { Types } from "mongoose";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const session = await mongoose.startSession();
  const rootDirId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  session.startTransaction();
  try {
    // Create root directory
    const rootDir = new Directory({
      _id: rootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
    });

    await rootDir.save({ session });

    // Create user
    const newUser = new User({
      _id: userId,
      name,
      email,
      password,
      rootDirId,
    });

    await newUser.save({ session });
    await session.commitTransaction();
    res.status(201).json({ message: "User Registered", newUser });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyValue.email) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }
    await session.abortTransaction();
    next(err);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(404).json({ error: "Invalid credentials" });
  }
  res.cookie("uid", user._id.toString(), {
    httpOnly: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.status(200).json({ message: "Loged in" });
};

export const logout = async (_, res) => {
  res.clearCookie("uid");
  res.status(200).json({ message: "Logged Out" });
};

export const getUser = async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};
