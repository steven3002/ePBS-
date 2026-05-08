# EIP-7732 Event Map (Glamsterdam)

This document defines the schema for ePBS-related events observed via the Beacon API.

## 1. Core Event Schemas

### A. Execution Payload Bid
**Type:** `execution_payload_bid`
*Source:* Builder Network / Beacon API
*Description:* Represents a builder's commitment to a slot.

| Field | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `slot` | Integer | Yes | The target slot number. |
| `builder_index` | Integer | Yes | The index of the builder in the protocol. |
| `block_hash` | String | Yes | The execution block hash committed by the builder. |
| `value` | String | No | The bid value in Gwei. |

### B. Execution Payload Available
**Type:** `execution_payload_available`
*Source:* P2P / Beacon API
*Description:* Confirms the signed execution payload has been revealed.

| Field | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `slot` | Integer | Yes | Must match the bid slot. |
| `block_hash` | String | Yes | Must match the bid block_hash. |

### C. PTC Message (Payload Timeliness Committee)
**Type:** `payload_attestation_message`
*Source:* PTC Validators
*Description:* The committee's verdict on data presence.

| Field | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `slot` | Integer | Yes | The slot being attested. |
| `payload_present` | Boolean | Yes | Whether the payload was seen by the PTC. |
| `blob_data_available` | Boolean | Yes | Whether associated blobs were available. |

---

## 2. Logic Truth Table (The Classifier)

The tool uses a conservative "Candidate" logic to classify slot outcomes based on local observations.

| Bid Seen | Payload Available | PTC Vote (Present) | Classification Result |
| :--- | :--- | :--- | :--- |
| Yes | Yes | True | `full_slot_candidate` |
| Yes | No | False | `empty_slot_candidate` |
| Yes | Yes | False | `payload_invalid_candidate` |
| No | No | N/A | `skipped_slot_candidate` |
| Yes | Unknown | Unknown | `insufficient_data` |

> **Note:** If `builder_index` is missing from an `execution_payload_bid`, the record is flagged as `unknown` and an error is logged.