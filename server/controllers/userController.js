import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import Otp from "../models/otp.model.js";
import User from "../models/userModel.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";
import { sendOtp } from "../utils/sendOTP.js";
import mongoose, { Types } from "mongoose";
import redisClient from "../config/redis.js";
import { rm } from "fs/promises";
import path from "path";
import {
  loginSchema,
  loginWithGoogleSchema,
  otpSchema,
  passwordForGoogleSchema,
  registerSchema,
  sendOtpSchema,
} from "../validators/userSchema.js";
import { z } from "zod/v4";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
const window = new JSDOM("").window;
const purify = DOMPurify(window);
import bcrypt from "bcrypt";

export const register = async (req, res, next) => {
  const { success, error, data } = registerSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: error.flatten().fieldErrors });
  }

  let { name, email, password, otp } = data;

  name = purify.sanitize(name);
  email = purify.sanitize(email);
  password = purify.sanitize(password);
  otp = purify.sanitize(otp);

  const otpRecord = await Otp.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  await otpRecord.deleteOne();

  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.create(
      [
        {
          _id: rootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
        },
      ],
      { session }
    );

    await User.create(
      [
        {
          _id: userId,
          name,
          email,
          password,
          rootDirId,
          createdWith: "email",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.code === 11000 && err.keyValue.email) {
      return res.status(409).json({
        error: "This email already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }

    next(err);
  }
};

export const login = async (req, res) => {
  const { success, error, data } = loginSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.flatten().fieldErrors });
  }
  let { email, password } = data;

  email = purify.sanitize(email);
  password = purify.sanitize(password);

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  const passwordMatch = user.isPasswordCorrect(password);
  if (!passwordMatch) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  const allSessions = await redisClient.ft.search(
    "userIdIdx",
    `@userId:{${user.id}}`,
    {
      RETURN: [],
    }
  );

  if (allSessions.documents.length >= 2) {
    await redisClient.del(allSessions.documents[0].id);
  }

  const sessionId = crypto.randomUUID();
  const redisKey = `session:${sessionId}`;
  await redisClient.json.set(redisKey, "$", {
    userId: user._id,
    rootDirId: user.rootDirId,
    role: user.role,
  });

  redisClient.expire(redisKey, 60 * 60 * 24 * 7);

  res.cookie("sid", sessionId, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
    sameSite: "lax",
  });
  res.json({ message: "Logged In" });
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const user = await User.findById(req.user._id).lean();
    const rootDir = await Directory.findById(user.rootDirId).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      maxStorageInBytes: user.maxStorageInBytes,
      createdWith: user.createdWith,
      usedStorageInBytes: rootDir.size,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`session:${sid}`);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutFromAllDevices = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await redisClient.json.get(`session:${sid}`);
  const allSession = await redisClient.ft.search(
    "userIdIdx",
    `@userId:{${session.userId}}`,
    {
      RETURN: [],
    }
  );
  for (const session of allSession.documents) {
    await redisClient.del(session.id);
  }
  res.clearCookie("sid");

  res.status(204).end();
};

export const sendOTP = async (req, res) => {
  const { success, data } = sendOtpSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: z.flattenError(error).fieldErrors });
  }

  let { email } = data;
  email = purify.sanitize(email);
  const resData = await sendOtp(email);
  res.json(resData);
};

export const verifyOTP = async (req, res) => {
  const { success, data } = otpSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: z.flattenError(error).fieldErrors });
  }

  try {
    let { email, otp } = data;
    email = purify.sanitize(email);
    otp = purify.sanitize(otp);
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP Verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginWithGoogle = async (req, res, next) => {
  const { success, data, error } = loginWithGoogleSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: error.flatten().fieldErrors });
  }
  const { code } = data;
  const userData = await verifyGoogleToken(code);
  const { email, name, picture } = userData;

  const existingUser = await User.findOne({ email }).select("-__v");

  if (existingUser) {
    if (existingUser.IsDeleted) {
      return res.status(403).json({
        error: "Your account has been deleted. Contact App Owner to recover",
      });
    }

    const allSessions = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${existingUser._id}}`,
      {
        RETURN: [],
      }
    );

    if (allSessions.documents.length >= 2) {
      await redisClient.del(allSessions.documents[0].id);
    }

    if (!existingUser.picture.includes("googleusercontent")) {
      existingUser.picture = picture;
      await existingUser.save();
    }

    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`;
    await redisClient.json.set(redisKey, "$", {
      userId: existingUser._id,
      rootDirId: existingUser.rootDirId,
      role: existingUser.role,
    });
    redisClient.expire(redisKey, 60 * 60 * 24 * 7);

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged In", userData });
  }

  const mongooseSession = await mongoose.startSession();

  try {
    mongooseSession.startTransaction();

    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    const directory = new Directory({
      _id: rootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
    });

    const user = new User({
      _id: userId,
      name,
      email,
      picture,
      rootDirId,
      createdWith: "google",
    });

    await directory.save({ session: mongooseSession });
    await user.save({ session: mongooseSession });

    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`;
    await redisClient.json.set(redisKey, "$", {
      userId: user._id,
      rootDirId: user.rootDirId,
      role: user.role,
    });
    redisClient.expire(redisKey, 60 * 60 * 24 * 7);

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    await mongooseSession.commitTransaction();

    return res
      .status(201)
      .json({ message: "Account created and logged In", user });
  } catch (err) {
    await mongooseSession.abortTransaction();
    console.error("Registration Error:", err);
    return next(err);
  } finally {
    mongooseSession.endSession();
  }
};

export const setPasswordForGoogleUser = async (req, res, next) => {
  const result = passwordForGoogleSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.flatten().fieldErrors,
    });
  }

  let { password } = result.data;
  password = purify.sanitize(password);

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password) {
      return res.status(400).json({ error: "Password already set" });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    return res.status(200).json({
      message:
        "Password set successfully. You can now log in with email/password.",
    });
  } catch (err) {
    console.error("Set Password Error:", err);
    next(err);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const isOwner = req.user.role === "Owner";
    const query = isOwner ? {} : { IsDeleted: false };

    const users = await User.find(query)
      .select("_id name email IsDeleted role")
      .lean();

    let cursor = "0";
    let loggedInUserIds = new Set();

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: "session:*",
        COUNT: 100,
      });

      cursor = result.cursor;

      for (const key of result.keys) {
        const session = await redisClient.json.get(key);
        if (session?.userId) {
          loggedInUserIds.add(session.userId.toString());
        }
      }
    } while (cursor !== "0");

    const usersWithStatus = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isLoggedIn: loggedInUserIds.has(user._id.toString()),
      isDeleted: user.IsDeleted,
      role: user.role,
    }));

    res.status(200).json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUsingRole = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Invalid or missing userId in URL." });
    }
    const allSessions = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${userId}}`,
      {
        RETURN: [],
      }
    );

    for (const session of allSessions.documents) {
      await redisClient.del(session.id);
    }

    res
      .status(200)
      .json({ message: "Logged out from all sessions successfully." });
  } catch (err) {
    next(err);
  }
};

export const deleteUsingRoleBySoftDelete = async (req, res, next) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId.toString()) {
    return res.status(403).json({ message: "You can't delete yourself." });
  }

  try {
    await User.findByIdAndUpdate(userId, {
      IsDeleted: true,
    });

    return res
      .status(200)
      .json({ message: "User and all related data deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export const deleteUsingRoleByHardDelete = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { userId } = req.params;

    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({ message: "You can't delete yourself." });
    }

    session.startTransaction();

    // Step 1: Delete files from disk
    const userFiles = await File.find({ userId }).session(session);

    for (const file of userFiles) {
      const filePath = path.resolve("storage", `${file._id}${file.extension}`);
      try {
        await rm(filePath);
      } catch (err) {
        console.warn(`Could not delete file: ${filePath}`, err.message);
      }
    }

    // Step 2: Delete related DB entries
    await File.deleteMany({ userId }).session(session);
    await Directory.deleteMany({ userId }).session(session);
    await User.deleteOne({ _id: userId }).session(session);

    // Step 3: Clear sessions from Redis
    const allSessions = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${userId}}`,
      { RETURN: [] }
    );

    for (const redisSession of allSessions.documents) {
      await redisClient.del(redisSession.id);
    }

    await session.commitTransaction();
    res.status(200).json("User Deleted successfully");
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const recoverUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== "Owner") {
      return res
        .status(403)
        .json({ message: "Only owners can recover users." });
    }

    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({ message: "You can't recover yourself." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.IsDeleted === false) {
      return res.status(400).json({ message: "User is already active." });
    }

    user.IsDeleted = false;
    await user.save();

    return res
      .status(200)
      .json({ message: "User and all related data recover successfully." });
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const ownerProvidedRole = ["Admin", "Manager"];

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({ message: "You can't change your role." });
    }

    if (!ownerProvidedRole.includes(role)) {
      return res
        .status(400)
        .json({ message: "You have no permission to change this role." });
    }

    if (req.user.role === "Owner") {
      await User.findByIdAndUpdate(userId, { role }, { new: true });
      return res.status(200).json({ message: "Role updated by Owner." });
    }
    if (req.user.role === "Admin") {
      if (role === "Owner" || user.role === "Owner") {
        return res
          .status(403)
          .json({ message: "Admin cannot change Owner's role." });
      }
      await User.findByIdAndUpdate(userId, { role }, { new: true });
      return res.status(200).json({ message: "Role updated by Admin." });
    }

    return res
      .status(403)
      .json({ message: "You are not allowed to change roles." });
  } catch (error) {
    next(error);
  }
};
