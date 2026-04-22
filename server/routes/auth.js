const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, refresh, logout, getMe } = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const authenticate = require("../middleware/authenticate");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Le nom est requis."),
  body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Le téléphone est requis."),
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

module.exports = router;