# Metrics Specification

All metrics follow the Prometheus standard: `namespace_subsystem_name_unit`.

## 1. Namespace: `epbs_pulse`

### Counters (Tracking Totals)
*Used for long-term trends and "Total" panels.*

| Metric Name | Description | Labels |
| :--- | :--- | :--- |
| `epbs_pulse_slots_observed_total` | Total slots processed | N/A |
| `epbs_pulse_payload_bids_total` | Total bids seen | `builder_index` |
| `epbs_pulse_slot_state_total` | Count of slot outcomes | `state` (e.g., full_slot_candidate) |

### Gauges (Status Lights)
*Used for "Current Status" and health checks.*

| Metric Name | Description | Value |
| :--- | :--- | :--- |
| `epbs_pulse_last_slot_number` | The number of the last observed slot | Integer |
| `epbs_pulse_api_connectivity` | Beacon API health status | 1 (Up), 0 (Down) |

## 2. Alert Thresholds (Initial Draft)

*   **Empty Slot Alert:** Trigger if `epbs_pulse_slot_state_total{state="empty_slot_candidate"}` increases > 2 in 10 minutes.
*   **PTC Conflict Alert:** Trigger if `state="payload_invalid_candidate"` is observed.