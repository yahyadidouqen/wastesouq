const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const upload = require("../middleware/upload");

// POST /api/listings
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { materialType, quantity, unit, city, lat, lng, description, phone, whatsapp } = req.body;

    if (!materialType || !quantity || !unit || !city || !phone) {
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants." });
    }

    const listing = new Listing({
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      materialType,
      quantity: Number(quantity),
      unit,
      location: { city, coordinates: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null } },
      description,
      contact: { phone, whatsapp: whatsapp === "true" },
    });

    await listing.save();
    res.status(201).json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listings
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

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Annonce introuvable." });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
