// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 999;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Score a listing against a buyer profile (0-100)
function scoreListing(listing, profile) {
  let score = 0;
  const breakdown = { materialMatch: 0, distanceScore: 0, quantityScore: 0 };

  // 1. Material match (40 points)
  if (profile.interestedIn.includes(listing.materialType)) {
    score += 40;
    breakdown.materialMatch = 40;
  } else {
    return { score: 0, breakdown }; // No match at all
  }

  // 2. Distance score (35 points)
  const distance = calculateDistance(
    profile.location.lat, profile.location.lng,
    listing.location?.coordinates?.lat, listing.location?.coordinates?.lng
  );
  if (distance <= 30) { score += 35; breakdown.distanceScore = 35; }
  else if (distance <= 60) { score += 25; breakdown.distanceScore = 25; }
  else if (distance <= profile.radius) { score += 15; breakdown.distanceScore = 15; }
  else { score += 5; breakdown.distanceScore = 5; }

  // 3. Quantity match (25 points)
  const qty = listing.quantity;
  if (qty >= profile.minQuantity && qty <= profile.maxQuantity) {
    score += 25;
    breakdown.quantityScore = 25;
  } else if (qty >= profile.minQuantity * 0.5 && qty <= profile.maxQuantity * 1.5) {
    score += 12;
    breakdown.quantityScore = 12;
  }

  return { score, breakdown, distance: Math.round(distance) };
}

// Find all matching buyer profiles for a listing
async function findMatches(listing, BuyerProfile) {
  const profiles = await BuyerProfile.find({
    interestedIn: listing.materialType,
    notificationsEnabled: true,
  }).populate("userId", "name email phone");

  const results = profiles
    .map((profile) => {
      const { score, breakdown, distance } = scoreListing(listing, profile);
      return { profile, score, breakdown, distance };
    })
    .filter((r) => r.score >= 40) // Only decent matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10

  return results;
}

module.exports = { scoreListing, findMatches, calculateDistance };
