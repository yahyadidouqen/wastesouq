const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },

  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["seller", "buyer", "admin"], default: "seller" },

  phone: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, enum: ["seller", "buyer", "admin"], default: "seller" },
  googleId: { type: String, default: null },
  avatar: { type: String, default: null },

  refreshToken: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },

  // MFA fields
  mfaEnabled: { type: Boolean, default: false },
  otpCode: { type: String, default: null },         // hashed OTP
  otpExpires: { type: Date, default: null },         // OTP expiry
  otpAttempts: { type: Number, default: 0 },        // wrong OTP attempts

  createdAt: { type: Date, default: Date.now },
});


// Hash password before saving

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


// Compare password method


UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};


// Check if account is locked

UserSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model("User", UserSchema);