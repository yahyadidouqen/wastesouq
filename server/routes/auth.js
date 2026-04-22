const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
<<<<<<< HEAD
=======
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
const { register, login, refresh, logout, getMe } = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const authenticate = require("../middleware/authenticate");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Le nom est requis."),
  body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
<<<<<<< HEAD
  body("phone").trim().notEmpty().withMessage("Le téléphone est requis."),
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
  body("password").isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères."),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
  body("password").notEmpty().withMessage("Le mot de passe est requis."),
];

router.post("/register", registerLimiter, registerValidation, register);
router.post("/login", loginLimiter, loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

<<<<<<< HEAD
=======
// Google OAuth
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
        `&role=${user.role}` +
        `&id=${user._id}` +
        `&avatar=${encodeURIComponent(user.avatar || "")}`
      );
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
module.exports = router;