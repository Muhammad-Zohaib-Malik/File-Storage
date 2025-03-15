import { ObjectId } from "mongodb";

export default function (_, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid id ${id}` });
  }
  next();
}
