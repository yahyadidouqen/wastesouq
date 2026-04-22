const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// REGISTER
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, phone, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Un compte avec cet email existe déjà." });
    }

    const user = new User({ name, email, phone, password });
    await user.save();

    res.status(201).json({ success: true, message: "Compte créé avec succès. Vous pouvez maintenant vous connecter." });
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    // Check lock
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Compte temporairement verrouillé. Réessayez dans ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock 15 min
      }
      await user.save();
      const remaining = 5 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: remaining > 0
          ? `Email ou mot de passe incorrect. ${remaining} tentative(s) restante(s).`
          : "Compte verrouillé pour 15 minutes.",
      });
    }

    // Reset attempts on success
    user.loginAttempts = 0;
    user.lockUntil = null;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// REFRESH TOKEN
exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "Token manquant." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const hashed = hashToken(token);
    const user = await User.findOne({ _id: decoded.userId, refreshToken: hashed });

    if (!user) return res.status(401).json({ success: false, message: "Token invalide." });

    // Rotate refresh token
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

// LOGOUT
exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    } catch {}
  }
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ success: true, message: "Déconnexion réussie." });
};

// GET ME
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -refreshToken -loginAttempts -lockUntil");
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    res.json({ success: true, user });
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};