import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import Otp from "../models/otp.model.js";
import Session from "../models/sessionMode.js";
import User from "../models/userModel.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";
import { sendOtp } from "../utils/sendOTP.js";
import mongoose, { Types } from "mongoose";
import redisClient from "../config/redis.js";

export const register = async (req, res, next) => {
  const { name, email, password, otp } = req.body;

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
      { session },
    );

    await User.create(
      [
        {
          _id: userId,
          name,
          email,
          password,
          rootDirId,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Registration Error:", err);

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
export const login = async (req, res, next) => {
  const { email, password } = req.body;
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
    },
  );

  if (allSessions.documents.length >= 2) {
    await redisClient.del(allSessions.documents[0].id);
  }

  const sessionId = crypto.randomUUID();
  const redisKey = `session:${sessionId}`;
  await redisClient.json.set(redisKey, "$", {
    userId: user._id,
    rootDirId: user.rootDirId,
  });
  redisClient.expire(redisKey, 60 * 60 * 24 * 7);

  res.cookie("sid", sessionId, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "Logged In" });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.status(200).json({
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await redisClient.del(`session:${sid}`);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutFromAllDevices = async (req, res) => {
  const allSession = await redisClient.ft.search(
    "userIdIdx",
    `@userId:{${req.user._id}}`,
    {
      RETURN: [],
    },
  );
  for (const session of allSession.documents) {
    await redisClient.del(session.id);
  }
  res.clearCookie("sid");

  res.status(204).end();
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const resData = await sendOtp(email);
  res.json(resData);
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
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
  const { idToken } = req.body;
  const userData = await verifyGoogleToken(idToken);
  const { email, name, picture } = userData;

  const existingUser = await User.findOne({ email }).select("-__v");

  if (existingUser) {
    const allSessions = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${existingUser._id}}`,
      {
        RETURN: [],
      },
    );

    const info = await redisClient.ft.info("userIdIdx");
    console.log("Docs:", info.num_docs);
    console.log("All Sessions:", allSessions.documents);

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
    });
    redisClient.expire(redisKey, 60 * 60 * 24 * 7);

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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
    });

    await directory.save({ session: mongooseSession });
    await user.save({ session: mongooseSession });

    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`;
    await redisClient.json.set(redisKey, "$", {
      userId: user._id,
      rootDirId: user.rootDirId,
    });
    redisClient.expire(redisKey, 60 * 60 * 24 * 7);

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("_id name email").lean();
    const usersWithLoginStatus = await Promise.all(
      users.map(async (user) => {
        const sessionCount = await Session.countDocuments({ userId: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          isLoggedIn: sessionCount > 0,
        };
      }),
    );

    res.status(200).json({ users: usersWithLoginStatus });
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
    await Session.deleteMany({ userId });
    res
      .status(200)
      .json({ message: "Logged out from all sessions successfully." });
  } catch (err) {
    next(err);
  }
};

export const deleteUsingRole = async (req, res, next) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId.toString()) {
    return res.status(403).json({ message: "You can't delete yourself." });
  }

  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "Invalid or missing userId." });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const userFiles = await File.find({ userId }).session(session);
    await Promise.all([
      User.deleteOne({ _id: userId }).session(session),
      Session.deleteMany({ userId }).session(session),
      File.deleteMany({ userId }).session(session),
      Directory.deleteMany({ userId }).session(session),
    ]);

    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "User and all related data deleted successfully." });
  } catch (error) {
    await session.abortTransaction();
    return res
      .status(500)
      .json({ message: error.message || "Deletion failed." });
  } finally {
    session.endSession();
  }
};
