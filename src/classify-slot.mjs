/**
 * Pure function to classify the state of an ePBS slot.
 * @param {Object} summary - The aggregated observation state for a slot.
 * @returns {string} - Conservative state label.
 */
export function classifySlot(summary) {
  const { bid_seen, payload_available, payload_present } = summary;

  if (!bid_seen) {
    return "unknown";
  }

  // Case 1: All signals positive
  if (bid_seen && payload_available && payload_present) {
    return "full_slot_candidate";
  }

  // Case 2: Bid seen but builder ghosts or PTC reports missing
  if (bid_seen && !payload_available && !payload_present) {
    return "empty_slot_candidate";
  }

  // Case 3: Builder provided payload, but PTC rejected it ( late or invalid)
  if (bid_seen && payload_available && !payload_present) {
    return "payload_invalid_candidate";
  }

  return "insufficient_data";
}
