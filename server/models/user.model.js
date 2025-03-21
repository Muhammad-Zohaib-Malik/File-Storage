import { mongoose, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [
        3,
        "name field should a string with at least three characters",
      ],
      required: [true, "name is required"],
    },
    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
        "please enter a valid email",
      ],
      required: [true, "name is required"],
    },
    password: {
      type: String,
      minLength: 4,
      required: [true, "Password is required"],
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      required: [true, "root dir Id is required"],
    },
  },
  { timestamps: true, strict: "throw" }
);

export const User = mongoose.model("User", UserSchema);
