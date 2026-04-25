const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  register, login, refresh, logout, getMe,
  verifyEmail, resendVerification,
  verifyOTP, resendOTP, toggleMFA,
} = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const authenticate = require("../middleware/authenticate");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Le nom est requis."),
  body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Minimum 8 caractères."),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
  body("password").notEmpty().withMessage("Le mot de passe est requis."),
];

// ─── Standard auth ────────────────────────────────────────────
router.post("/register", registerLimiter, registerValidation, register);
router.post("/login", loginLimiter, loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

// ─── Email verification (after register) ─────────────────────
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// ─── MFA OTP (after login) ────────────────────────────────────
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/toggle-mfa", authenticate, toggleMFA);

// ─── Google OAuth ─────────────────────────────────────────────
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await user.save();
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}` +
        `&name=${encodeURIComponent(user.name)}` +
        `&email=${encodeURIComponent(user.email)}` +
        `&role=${user.role}&id=${user._id}` +
        `&avatar=${encodeURIComponent(user.avatar || "")}`
      );
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;