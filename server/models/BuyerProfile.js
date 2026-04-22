const mongoose = require("mongoose");

const BuyerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  interestedIn: {
    type: [String],
    enum: ["Plastique","Métal","Papier & Carton","Verre","Bois","Textile","Déchets organiques","Gravats & Construction","Électronique","Autre"],
    default: [],
  },
  minQuantity: { type: Number, default: 0 },
  maxQuantity: { type: Number, default: 999999 },
  unit: { type: String, enum: ["kg","tonnes","litres","unités"], default: "kg" },
  location: {
    city: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  radius: { type: Number, default: 100 }, // km
  notificationsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BuyerProfile", BuyerProfileSchema);