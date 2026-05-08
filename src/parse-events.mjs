import fs from 'fs';
import { classifySlot } from './classify-slot.mjs';

const filePath = process.argv[2];

if (!filePath) {
  console.error("Error: Please provide a fixture file path.");
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const events = JSON.parse(rawData);

  if (!Array.isArray(events) || events.length === 0) {
    console.log("slot=unknown verdict=unknown (Empty or malformed event stream)");
    process.exit(0);
  }

  // State Accumulator (State Normalization)
  const summary = {
    slot: null,
    bid_seen: false,
    payload_available: false,
    payload_present: false,
  };

  for (const event of events) {
    // Slot ID Check
    if (summary.slot !== null && event.slot !== summary.slot) {
      throw new Error(`Slot Mismatch: Expected ${summary.slot}, found ${event.slot}`);
    }
    summary.slot = event.slot;

    // Folding logic
    switch (event.type) {
      case 'execution_payload_bid':
        summary.bid_seen = true;
        break;
      case 'execution_payload_available':
        summary.payload_available = true;
        break;
      case 'payload_attestation_message':
        summary.payload_present = event.payload_present;
        break;
    }
  }

  const verdict = classifySlot(summary);

  // Terminal Output (Task 5)
  console.log(`------------------------------------`);
  console.log(`EPBS PULSE REPORT | Slot: ${summary.slot}`);
  console.log(`------------------------------------`);
  console.log(`Bid Seen:          ${summary.bid_seen}`);
  console.log(`Payload Available: ${summary.payload_available}`);
  console.log(`PTC Verdict:       ${summary.payload_present ? 'PRESENT' : 'MISSING/INVALID'}`);
  console.log(`------------------------------------`);
  console.log(`FINAL VERDICT:     ${verdict}`);
  console.log(`------------------------------------`);

} catch (err) {
  console.error(` Critical Failure: ${err.message}`);
  process.exit(1);
}
