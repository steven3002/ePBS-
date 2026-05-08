import fs from 'fs';
import { classifySlot } from './classify-slot.mjs';

const filePath = process.argv[2];

// The Metric Registry
const registry = {
  slots_observed_total: 0,
  payload_bids_total: 0,
  parse_errors_total: 0,
  // track verdicts by label
  verdict_counts: {
    full_slot_candidate: 0,
    empty_slot_candidate: 0,
    payload_invalid_candidate: 0,
    skipped_slot_candidate: 0,
    unknown: 0
  }
};

// Formatter
function formatMetric(name, help, type, value, labels = null) {
  let output = `# HELP ${name} ${help}\n`;
  output += `# TYPE ${name} ${type}\n`;
  
  if (labels) {
    const labelString = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    output += `${name}{${labelString}} ${value}\n`;
  } else {
    output += `${name} ${value}\n`;
  }
  return output;
}

// Data Ingestion & Error Handling
let events = [];
try {
  if (!filePath) throw new Error("No file path provided.");
  const rawData = fs.readFileSync(filePath, 'utf8');
  events = JSON.parse(rawData);
} catch (err) {
  registry.parse_errors_total += 1;
  console.log(formatMetric('epbs_pulse_parse_errors_total', 'Total malformed JSON errors', 'counter', registry.parse_errors_total));
  process.exit(1);
}

// Map Classifier Outputs to Counters
const summary = {
  slot: null,
  builder_index: null,
  bid_seen: false,
  payload_available: false,
  payload_present: false,
};

for (const event of events) {
  summary.slot = event.slot;
  if (event.type === 'execution_payload_bid') {
    summary.bid_seen = true;
    summary.builder_index = event.builder_index;
    registry.payload_bids_total += 1;
  }
  if (event.type === 'execution_payload_available') {
    summary.payload_available = true;
  }
  if (event.type === 'payload_attestation_message') {
    summary.payload_present = event.payload_present;
  }
}

if (summary.slot !== null) {
  registry.slots_observed_total += 1;
}

const verdict = classifySlot(summary);
registry.verdict_counts[verdict] = (registry.verdict_counts[verdict] || 0) + 1;

// Mock the Scrape Endpoint (Console Output)
console.log(formatMetric(
  'epbs_pulse_slots_observed_total', 
  'Total number of slots processed', 
  'counter', 
  registry.slots_observed_total
));

console.log(formatMetric(
  'epbs_pulse_payload_bids_total', 
  'Total number of valid bids seen', 
  'counter', 
  registry.payload_bids_total,
  summary.builder_index ? { builder: summary.builder_index } : null
));

console.log(formatMetric(
  'epbs_pulse_parse_errors_total', 
  'Total malformed JSON errors', 
  'counter', 
  registry.parse_errors_total
));

// Export verdicts as Gauges (Status Lights)
for (const [state, count] of Object.entries(registry.verdict_counts)) {
  if (count > 0) {
    console.log(formatMetric(
      'epbs_pulse_slot_verdict', 
      'Current status of observed slots (1 for triggered)', 
      'gauge', 
      count, //  gauge works for a single-slot snapshot
      { state: state, slot: summary.slot }
    ));
  }
}
