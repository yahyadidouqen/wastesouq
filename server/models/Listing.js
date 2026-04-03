const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  photo: { type: String },
  materialType: {
    type: String,
    enum: ["Plastique","Métal","Papier & Carton","Verre","Bois","Textile","Déchets organiques","Gravats & Construction","Électronique","Autre"],
    required: true,
  },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ["kg","tonnes","litres","unités"], required: true },
  location: {
    city: { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
  },
  description: { type: String },
  contact: {
    phone: { type: String, required: true },
    whatsapp: { type: Boolean, default: false },
  },
  status: { type: String, enum: ["active","sold","expired"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Listing", ListingSchema);
