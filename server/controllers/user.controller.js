import { writeFile } from "fs/promises";
import directoriesData from "../directoriesDB.json" with { type: "json" };
import usersData from "../usersDB.json" with { type: "json" };

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const foundUser = usersData.find((user) => user.email === email);
  console.log(foundUser);
  if (foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message:
        "A user with this email address already exists. Please try logging in or use a different email.",
    });
  }

  const dirId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  directoriesData.push({
    id: dirId,
    name: `root-${email}`,
    userId,
    parentDirId: null,
    files: [],
    directories: [],
  });

  usersData.push({
    id: userId,
    name,
    email,
    password,
    rootDirId: dirId,
  });

  try {
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    await writeFile("./usersDB.json", JSON.stringify(usersData));
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = usersData.find((user) => user.email === email);
  if (!user || user.password !== password) {
    return res.status(404).json({ error: "Invalid credentials" });
  }
  res.cookie("uid", user.id, {
    httpOnly: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
  });
  res.json({ message: "Loged in" });
};

export const logout = async (req, res) => {
  res.clearCookie("uid");
  res.status(200).json({ message: "Logged Out" });
};

export const getUser = async (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};
