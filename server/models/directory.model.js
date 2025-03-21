import mongoose, { model, Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
  },
  { timestamps: true, strict: "throw" }
);

export const Directory = mongoose.model("Directory", directorySchema);
