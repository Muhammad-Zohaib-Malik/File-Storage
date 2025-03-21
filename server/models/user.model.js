import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "name is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: [true, "root dir Id is required"],
      
    },
  },
  { timestamps: true, strict: "throw" }
);

export const User = model("User", UserSchema);
