import Directory from "../models/directoryModel.js";
import Otp from "../models/otp.model.js";
import Session from "../models/sessionMode.js";
import User from "../models/userModel.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";
import { sendOtp } from "../utils/sendOTP.js";
import mongoose, { Types } from "mongoose";

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

  const allSessions = await Session.find({ userId: user._id });

  if (allSessions.length >= 2) {
    await allSessions[0].deleteOne();
  }

  const session = await Session.create({ userId: user._id });

  res.cookie("sid", session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "Logged In" });
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid);
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutFromAllDevices = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await Session.findById(sid);
  await Session.deleteMany({ userId: session.userId });
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
    const allSessions = await Session.find({ userId: existingUser._id });

    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne();
    }

    if(!existingUser.picture.includes("googleusercontent")) {
      existingUser.picture = picture;
      await existingUser.save();
    }

    const session = await Session.create({ userId: existingUser._id });

    res.cookie("sid", session.id, {
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

    const session = await Session.create({ userId: user._id });

    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    await mongooseSession.commitTransaction();
   
    return res.status(201).json({ message: "Account created and logged In", user });

  } catch (err) {
    await mongooseSession.abortTransaction();
    console.error("Registration Error:", err);
    return next(err);
  } finally {
    mongooseSession.endSession();
  }
};



export const getAllUsers = async (req, res, next) => {
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
      })
    );

    res.status(200).json({ users: usersWithLoginStatus });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
