import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, require: true, trim: true, unique: true },
    password: { type: String, require: true },
  },
  { timestamps: true }
);

module.export = mongoose.model("Admin", adminSchema);
