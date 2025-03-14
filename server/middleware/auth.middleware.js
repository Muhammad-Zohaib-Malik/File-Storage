import { ObjectId } from "mongodb";


export const checkAuth = async(req, res, next) => {
  const { uid } = req.cookies;
  const db=req.db

  if (!uid ) {
    return res.status(401).json({ error: "Not Logges In" });
  }
  const user = await db.collection("users").findOne({_id:new ObjectId(uid)})
  if ( !user) {
    return res.status(401).json({ error: "Not User Found" });
  }
  req.user = user;
  next();
};
