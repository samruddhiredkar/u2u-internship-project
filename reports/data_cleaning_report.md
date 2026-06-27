# Data Cleaning Report — Incident Database

This report documents the cleaning process applied to `incidents_db_raw.csv` before it was loaded into storage.

## Source file
`data_raw/incidents_db_raw.csv` — raw incident log exported in Task 1, before any cleaning.

## Issues found and fixed

| Issue | Found | Fix applied |
|---|---|---|
| Duplicate row | INC-003 appeared twice | Removed duplicate, kept first occurrence |
| Inconsistent casing | `severity` had both "high" and "High" | Standardized to Title Case |
| Trailing whitespace | "SQL Injection " had a trailing space | Stripped whitespace from text fields |
| Missing `status` | INC-005 had a blank status | Filled with "Under Review" (incident was still active per notes) |
| Missing `resolution_time_hrs` | INC-005 had a blank value | Filled with 0 (not yet resolved) |
| Invalid time value | INC-009 had time `99:99` | Replaced with "Unknown" instead of guessing |

## Before vs After summary

| Metric | Before | After |
|---|---|---|
| Total rows | 10 | 9 |
| Duplicate rows | 1 | 0 |
| Missing values (status) | 1 | 0 |
| Missing values (resolution_time_hrs) | 1 | 0 |
| Unique severity values | 4 (Critical, High, Medium, high) | 3 (Critical, High, Medium) |
| Invalid time entries | 1 | 0 |

## Why these choices were made
- Duplicates were removed instead of merged since both rows were exactly identical.
- Missing status/resolution time were filled based on context from the `notes` column rather than dropped, since dropping would lose a real incident record.
- The invalid time (`99:99`) was not guessed — it was replaced with "Unknown" to avoid introducing wrong data. This keeps the dataset honest rather than fabricating a timestamp.

## Output
Cleaned file saved as `incidents_db_cleaned.csv`, ready for Task 3 (Data Storage).
