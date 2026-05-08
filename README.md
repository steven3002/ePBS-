# Glamsterdam ePBS Pulse (MVP)

A read-only monitoring and readiness kit for Ethereum's EIP-7732 (Enshrined Proposer-Builder Separation).

## Overview
ePBS Pulse helps validator operators and infrastructure teams prepare for the **Glamsterdam** hard fork by tracking Payload Timeliness Committee (PTC) observations and execution payload availability.

This MVP demonstrates the core logic engine:
- **Parsing:** Ingesting ePBS-specific Beacon API events.
- **Classification:** Categorizing slots into "candidates" (Full, Empty, or Invalid).
- **Telemetry:** Exporting data in standard Prometheus OpenMetrics format.

## Quick Start (MVP Demo)

### Prerequisites
- Node.js (v18+)

### Installation
```bash
git clone https://github.com/steven3002/ePBS-pulse.git
cd epbs-
npm install
```

### Running the Simulator
Test the "Happy Path" (Successful block production):
```bash
npm run metrics:full
```

Test the "Ghost Builder" Path (Builder fails to reveal payload):
```bash
npm run metrics:empty
```

## Project Roadmap (Full  Grant)
This MVP covers the **Logic & Telemetry** layers. The full grant will implement:
1. **Live Mode:** Real-time Beacon API event-stream collector.
2. **Advanced Analytics:** Builder reveal latency tracking and Xatu-style query examples.
3. **Operator Runbook:** Comprehensive documentation for devnet troubleshooting.

