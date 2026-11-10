import mongoose from "mongoose";
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  category: { type: String, enum: ["mobile", "laptop", "accessories"] },
  state: { type: String, enum: ["pending", "cleaning"], default: "pending" },
  cleanupAfter: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  lastError: String,
}, { timestamps: true });
export default mongoose.model("ImageUpload", schema);
