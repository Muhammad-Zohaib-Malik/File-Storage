import { ObjectId } from "mongodb";

export const register = async (req, res, next) => {
  const db = req.db;
  const { name, email, password } = req.body;
  const user = await db.collection("users").findOne({ email });

  if (user) {
    return res.status(409).json({
      error: "User already exists",
      message:
        "A user with this email address already exists. Please try logging in or use a different email.",
    });
  }
  try {
    const rootDirId=new ObjectId()
    const userId=new ObjectId( )
    const dirCollection = db.collection("directories");
     await dirCollection.insertOne({
      _id:rootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId
    });

     await db.collection("users").insertOne({
      _id:userId,
      name,
      email,
      password,
      rootDirId,
      
    });

    
    await dirCollection.updateOne({ _id: rootDirId }, { $set: { userId } });
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  const user = await db.collection("users").findOne({ email, password });
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
