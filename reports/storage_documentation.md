# Storage Documentation — Task 3

## Storage method chosen: SQLite

For this project we went with **SQLite** instead of MySQL/MongoDB/PostgreSQL because:
- No server setup needed — the whole database is a single `.db` file
- Easy to include directly in the GitHub repo
- Good enough for the data volume we're working with at this stage
- Can be queried directly using Python's built-in `sqlite3` module, no extra installs

If this were a production system handling real-time data at scale, we'd move to PostgreSQL or MongoDB instead. SQLite made sense for an internship-scale project.

## File
`incident_response.db`

## Tables

### `incidents`
| Column | Type | Notes |
|---|---|---|
| incident_id | TEXT (Primary Key) | Unique ID like INC-001 |
| date | TEXT | Format: YYYY-MM-DD |
| time | TEXT | Format: HH:MM, or "Unknown" if invalid in source data |
| incident_type | TEXT | e.g. Phishing, Malware, DDoS |
| severity | TEXT | Restricted to: Critical, High, Medium, Low |
| affected_system | TEXT | System/server involved |
| source_ip | TEXT | Origin IP of the incident |
| destination_ip | TEXT | Target IP |
| status | TEXT | Resolved, In Progress, Escalated, Under Review |
| response_action | TEXT | What action was taken |
| analyst_name | TEXT | Who handled it |
| resolution_time_hrs | INTEGER | Hours taken to resolve (0 if unresolved) |
| notes | TEXT | Free text notes |

### `network_logs`
| Column | Type | Notes |
|---|---|---|
| log_id | TEXT (Primary Key) | Unique log ID |
| timestamp | TEXT | Format: YYYY-MM-DD HH:MM:SS |
| source_ip | TEXT | Origin IP |
| destination_ip | TEXT | Target IP |
| protocol | TEXT | TCP / UDP |
| port | INTEGER | Port number |
| bytes_sent | INTEGER | Data volume |
| action | TEXT | ALLOW or BLOCK |
| flagged | TEXT | Yes / No |
| flag_reason | TEXT | Why it was flagged, if applicable |

## How the AI agent queries this
The agent connects to `incident_response.db` using Python's `sqlite3` module and runs simple SQL queries — for example, pulling all past incidents of a matching type to compare against a new report, or checking `network_logs` for suspicious activity tied to a specific IP.

## How to load it yourself
```python
import sqlite3
import pandas as pd

conn = sqlite3.connect('incident_response.db')
df = pd.read_sql('SELECT * FROM incidents', conn)
print(df)
```
