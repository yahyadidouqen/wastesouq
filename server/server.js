<<<<<<< HEAD
=======

>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
<<<<<<< HEAD
const path = require("path");

const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
=======
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
<<<<<<< HEAD

app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/listings", require("./routes/listings"));
app.use("/api/auth", require("./routes/auth"));
=======
app.options("*", cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/buyers", require("./routes/buyers"));
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wastesouq")
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ Erreur MongoDB:", err));
