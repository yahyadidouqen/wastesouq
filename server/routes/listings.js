<<<<<<< HEAD

const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const upload = require("../middleware/upload");
const authenticate = require("../middleware/authenticate");

// POST /api/listings — create listing (authenticated)
=======
const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const BuyerProfile = require("../models/BuyerProfile");
const upload = require("../middleware/upload");
const authenticate = require("../middleware/authenticate");
const { findMatches } = require("../utils/matcher");

>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
router.post("/", authenticate, upload.single("photo"), async (req, res) => {
  try {
    const { materialType, quantity, unit, city, lat, lng, description, phone, whatsapp } = req.body;
    if (!materialType || !quantity || !unit || !city || !phone) {
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants." });
    }
    const listing = new Listing({
      photo: req.file ? `/uploads/${req.file.filename}` : null,
<<<<<<< HEAD
      materialType,
      quantity: Number(quantity),
      unit,
=======
      materialType, quantity: Number(quantity), unit,
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
      location: { city, coordinates: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null } },
      description,
      contact: { phone, whatsapp: whatsapp === "true" },
      seller: req.user.userId,
    });
    await listing.save();
<<<<<<< HEAD
=======
    findMatches(listing, BuyerProfile).then((matches) => {
      console.log(`✅ ${matches.length} acheteur(s) compatible(s) pour ${listing.materialType}`);
    }).catch(console.error);
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
    res.status(201).json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

<<<<<<< HEAD
// GET /api/listings — all active listings (public)
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
router.get("/", async (req, res) => {
  try {
    const filter = { status: "active" };
    if (req.query.materialType) filter.materialType = req.query.materialType;
    if (req.query.city) filter["location.city"] = new RegExp(req.query.city, "i");
    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

<<<<<<< HEAD
// GET /api/listings/my — seller's own listings (authenticated)
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
router.get("/my", authenticate, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

<<<<<<< HEAD
// GET /api/listings/:id — single listing (public)
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Annonce introuvable." });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

<<<<<<< HEAD
// PUT /api/listings/:id — update listing (authenticated + owner only)
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
router.put("/:id", authenticate, upload.single("photo"), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Annonce introuvable." });
    if (listing.seller?.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Non autorisé." });
    }
    const { materialType, quantity, unit, city, lat, lng, description, phone, whatsapp, status } = req.body;
    if (materialType) listing.materialType = materialType;
    if (quantity) listing.quantity = Number(quantity);
    if (unit) listing.unit = unit;
    if (city) listing.location.city = city;
    if (lat) listing.location.coordinates.lat = Number(lat);
    if (lng) listing.location.coordinates.lng = Number(lng);
    if (description !== undefined) listing.description = description;
    if (phone) listing.contact.phone = phone;
    if (whatsapp !== undefined) listing.contact.whatsapp = whatsapp === "true";
    if (status) listing.status = status;
    if (req.file) listing.photo = `/uploads/${req.file.filename}`;
    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

<<<<<<< HEAD
// DELETE /api/listings/:id — delete listing (authenticated + owner only)
=======
>>>>>>> 534679146d2bf61e88f96e4a865f5924bc7e3c67
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Annonce introuvable." });
    if (listing.seller?.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Non autorisé." });
    }
    await listing.deleteOne();
    res.json({ success: true, message: "Annonce supprimée." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;