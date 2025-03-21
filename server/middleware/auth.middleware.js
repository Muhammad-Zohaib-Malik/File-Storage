import { User } from "../models/user.model.js";

export const checkAuth = async (req, res, next) => {
  const { uid } = req.cookies;

  if (!uid) {
    return res.status(401).json({ error: "Not Logges In" });
  }
  const user = await User.findOne({ _id: uid }).lean();
  console.log(user);
  if (!user) {
    return res.status(401).json({ error: "Not User Found" });
  }
  req.user = user;
  next();
};
