const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { generateOTP, sendOTPEmail } = require("../utils/emailOTP");

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  res.cookie("refreshToken", refreshToken, cookieOptions);
  return accessToken;
};

// ─── REGISTER ─────────────────────────────────────────────────
// Creates account with isVerified: false + sends 6-digit code
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { name, email, phone, password } = req.body;
  try {
    const existing = await User.findOne({ email });

    // If account exists but not verified → resend new code
    if (existing && !existing.isVerified) {
      const otp = generateOTP();
      existing.otpCode = hashToken(otp);
      existing.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      existing.otpAttempts = 0;
      await existing.save();
      await sendOTPEmail(existing.email, otp, existing.name);
      return res.json({
        success: true,
        requiresVerification: true,
        userId: existing._id,
        message: "Un nouveau code a été envoyé à votre email.",
      });
    }

    // If account exists and is verified → error
    if (existing && existing.isVerified) {
      return res.status(400).json({ success: false, message: "Un compte avec cet email existe déjà." });
    }

    // Create new account with isVerified: false
    const user = new User({ name, email, phone, password, isVerified: false });
    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    user.otpCode = hashToken(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.otpAttempts = 0;
    await user.save();

    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      userId: user._id,
      message: `Un code de vérification a été envoyé à ${email}.`,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY EMAIL (after register) ────────────────────────────
// User enters 6-digit code → isVerified: true → auto login
exports.verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ success: false, message: "Données manquantes." });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Compte déjà vérifié." });
    }

    // Check expiry
    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Code expiré. Réinscrivez-vous pour en recevoir un nouveau." });
    }

    // Max attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ success: false, message: "Trop de tentatives. Réinscrivez-vous." });
    }

    // Verify OTP
    const hashedInput = hashToken(otp.trim());
    if (hashedInput !== user.otpCode) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({ success: false, message: `Code incorrect. ${remaining} tentative(s) restante(s).` });
    }

    // ✅ OTP correct → verify account + auto login
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    const accessToken = await issueTokens(user, res);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      message: "Compte vérifié avec succès !",
    });
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESEND VERIFICATION CODE ──────────────────────────────────
exports.resendVerification = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Compte déjà vérifié." });

    const otp = generateOTP();
    user.otpCode = hashToken(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    await sendOTPEmail(user.email, otp, user.name);
    res.json({ success: true, message: "Nouveau code envoyé." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });

    // Account not verified → redirect to verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        userId: user._id,
        message: "Veuillez vérifier votre email avant de vous connecter.",
      });
    }

    // Check lock
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, message: `Compte verrouillé. Réessayez dans ${minutesLeft} minute(s).` });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      const remaining = 5 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: remaining > 0 ? `Mot de passe incorrect. ${remaining} tentative(s) restante(s).` : "Compte verrouillé pour 15 minutes.",
      });
    }

    // MFA enabled → send OTP
    if (user.mfaEnabled) {
      const otp = generateOTP();
      user.otpCode = hashToken(otp);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      await user.save();
      await sendOTPEmail(user.email, otp, user.name);
      return res.json({
        success: true,
        mfaRequired: true,
        userId: user._id,
        message: `Code envoyé à ${user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`,
      });
    }

    // Normal login → issue tokens
    const accessToken = await issueTokens(user, res);
    res.json({
      success: true,
      mfaRequired: false,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY OTP (MFA login) ───────────────────────────────────
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ success: false, message: "Données manquantes." });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Code expiré. Reconnectez-vous." });
    }

    if (user.otpAttempts >= 5) {
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();
      return res.status(429).json({ success: false, message: "Trop de tentatives. Reconnectez-vous." });
    }

    const hashedInput = hashToken(otp.trim());
    if (hashedInput !== user.otpCode) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({ success: false, message: `Code incorrect. ${remaining} tentative(s) restante(s).` });
    }

    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    const accessToken = await issueTokens(user, res);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESEND OTP (MFA) ─────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

    const otp = generateOTP();
    user.otpCode = hashToken(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    await sendOTPEmail(user.email, otp, user.name);
    res.json({ success: true, message: "Nouveau code envoyé." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TOGGLE MFA ───────────────────────────────────────────────
exports.toggleMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

    user.mfaEnabled = !user.mfaEnabled;

    if (user.mfaEnabled) {
      const otp = generateOTP();
      user.otpCode = hashToken(otp);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOTPEmail(user.email, otp, user.name);
    } else {
      await user.save();
    }

    res.json({
      success: true,
      mfaEnabled: user.mfaEnabled,
      message: user.mfaEnabled ? "MFA activé." : "MFA désactivé.",
    });
  } catch (err) {
    console.error("TOGGLE MFA ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REFRESH ──────────────────────────────────────────────────
exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "Token manquant." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const hashed = hashToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== hashed) {
      return res.status(401).json({ success: false, message: "Token invalide." });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, cookieOptions);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: "Token expiré ou invalide." });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────
exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    } catch {}
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ success: true, message: "Déconnexion réussie." });
};

// ─── GET ME ───────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password -refreshToken -loginAttempts -lockUntil -otpCode -otpExpires -otpAttempts");
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};