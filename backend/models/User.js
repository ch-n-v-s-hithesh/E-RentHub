import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "delivery", "sales"],
      default: "customer",
      index: true,
    },
    phone: {
      type: String,
      default: "+91 73963 48793",
    },
    city: {
      type: String,
      default: "Eluru",
    },
    address: {
      type: String,
      default: "Powerpet Main Road, Eluru - 534002",
    },
    hub: {
      type: String,
      default: "Eluru Powerpet Hub",
    },
    assignedVehicle: {
      type: String,
      default: "EV Scooter (AP-37)",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return this.password === candidatePassword;
};

const User = mongoose.model("User", userSchema);
export default User;
