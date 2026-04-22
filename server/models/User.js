const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
<<<<<<< HEAD
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["seller", "buyer", "admin"], default: "seller" },
=======
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, enum: ["seller", "buyer", "admin"], default: "seller" },
  googleId: { type: String, default: null },
  avatar: { type: String, default: null },
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
  refreshToken: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

<<<<<<< HEAD
// Hash password before saving
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

<<<<<<< HEAD
// Compare password method
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

<<<<<<< HEAD
// Check if account is locked
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
UserSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model("User", UserSchema);