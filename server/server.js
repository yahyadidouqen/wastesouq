require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/listings", require("./routes/listings"));
app.use("/api/auth", require("./routes/auth"));

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wastesouq")
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ Erreur MongoDB:", err));
