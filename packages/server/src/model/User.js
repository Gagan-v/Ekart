import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    // Display name / username used for login (renamed from name for clarity)
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    sessionVersion: { type: Number, default: 0 },
    orders: [{
      createdAt: { type: Date, default: Date.now, required: true },
      status: { type: String, default: "placed", enum: ["placed"] },
      paymentStatus: { type: String, default: "pending", enum: ["pending"] },
      total: { type: Number, required: true, min: 0 },
      items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        title: { type: String, required: true },
        category: String,
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
      }],
    }],
    // Each user maintains their own cart in MongoDB
    // We tie cart items to the user's profile so it's persistent per account
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true, optimisticConcurrency: true }
);

const User = mongoose.model("User", userSchema);
export default User;
