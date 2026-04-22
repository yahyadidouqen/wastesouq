const express = require("express");
const router = express.Router();
const BuyerProfile = require("../models/BuyerProfile");
const Listing = require("../models/Listing");
const authenticate = require("../middleware/authenticate");
const { scoreListing } = require("../utils/matcher");

// GET /api/buyers/profile — get my buyer profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const profile = await BuyerProfile.findOne({ userId: req.user.userId });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/buyers/profile — create or update buyer profile
router.post("/profile", authenticate, async (req, res) => {
  try {
    const { interestedIn, minQuantity, maxQuantity, unit, city, lat, lng, radius, notificationsEnabled } = req.body;

    const profile = await BuyerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        interestedIn: interestedIn || [],
        minQuantity: minQuantity || 0,
        maxQuantity: maxQuantity || 999999,
        unit: unit || "kg",
        location: { city: city || "", lat: lat || null, lng: lng || null },
        radius: radius || 100,
        notificationsEnabled: notificationsEnabled !== false,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/buyers/matches — get matched listings for buyer
router.get("/matches", authenticate, async (req, res) => {
  try {
    const profile = await BuyerProfile.findOne({ userId: req.user.userId });
    if (!profile || profile.interestedIn.length === 0) {
      return res.json({ success: true, matches: [], message: "Configurez votre profil acheteur pour voir les annonces correspondantes." });
    }

    const listings = await Listing.find({
      status: "active",
      materialType: { $in: profile.interestedIn },
    }).sort({ createdAt: -1 });

    const matches = listings
      .map((listing) => {
        const { score, breakdown, distance } = scoreListing(listing, profile);
        return { listing, score, breakdown, distance };
      })
      .filter((m) => m.score >= 40)
      .sort((a, b) => b.score - a.score);

    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;