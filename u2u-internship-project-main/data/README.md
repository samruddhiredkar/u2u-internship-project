# data/ folder — AI Agent for Cybersecurity Incident Response

This folder has all the data files used by the AI agent. Each file is explained below — what it contains, where the data came from, and why the agent needs it.

---

## Folder structure

```
data/
├── README.md                        ← this file
├── incidents.xlsx                   ← incident log + threat actor database
├── network_logs.xlsx                ← network traffic logs
├── playbooks.json                   ← response steps for each attack type
├── cve_data.json                    ← known CVE vulnerability reference data
├── incident_response_guide.pdf      ← full IR guide loaded into the RAG pipeline
├── network_logs.csv                 ← network logs formatted for database import
└── incidents_db.csv                 ← incident records formatted for database import
```

---

## Excel files

### incidents.xlsx
This has two sheets. The first one is an incident log — every security incident we recorded with details like the date, type, severity, which system was affected, the IPs involved, what action was taken, and notes. The second sheet is a threat actor database with profiles of known attackers including their techniques and targets.

The agent uses this to look for patterns across past incidents, check if a current attack resembles something that happened before, and identify if a known threat actor might be involved.

Real data for this kind of file would come from a company's SOC logs or a SIEM export. For this project we built a realistic sample dataset.

---

### network_logs.xlsx
Network traffic log with source and destination IPs, protocol, port, bytes transferred, whether the traffic was blocked or allowed, and a flag reason if something looked suspicious.

The agent cross-references this with reported incidents to find related network activity — for example if a phishing incident was reported, it can check whether any suspicious outbound connections happened around the same time.

Real data would come from a firewall export or tools like Wireshark or Splunk.

---

## JSON files

### playbooks.json
Step-by-step response playbooks for five incident types: Phishing, Ransomware, DDoS, SQL Injection, and Unauthorized Access. Each playbook has detection indicators, the response steps in order, who is responsible for each step, time limits, and when to escalate.

This is basically the core logic the agent uses when responding to incidents. When an incident comes in, it pulls the right playbook and walks the analyst through what needs to happen.

The playbooks are based on the NIST SP 800-61 standard and SANS IR Handbook.

---

### cve_data.json
A reference database of five well-known CVEs — Log4Shell, EternalBlue, HTTP/2 Rapid Reset, Confluence RCE, and the Outlook zero-click vulnerability. Each entry has the CVSS score, affected software, exploitation status, and suggested mitigations.

When an incident involves a known vulnerability, the agent matches it here and recommends the right patch or workaround. Real CVE data is publicly available at nvd.nist.gov.

---

## PDF file

### incident_response_guide.pdf
A reference guide covering incident classification, the full response lifecycle, common attack types, and how the agent uses all the data files. This is what gets loaded into the RAG pipeline.

RAG stands for Retrieval-Augmented Generation — instead of the agent trying to remember everything, it searches through documents like this one at runtime and uses what it finds. So when someone asks the agent something like "what do I do during ransomware recovery", it actually reads the relevant section of this guide and responds based on that.

---

## CSV files (for database loading)

### network_logs.csv
Same data as network_logs.xlsx but in CSV format so it can be imported directly into a database. Table name: `network_logs`. Works with MySQL, PostgreSQL, SQLite — just a straight import.

The agent queries this table in real time to check for suspicious IPs and correlate network activity with active incidents.

---

### incidents_db.csv
All incident records in CSV format for database import. Table name: `incidents`. The agent queries this to retrieve past incidents of the same type, calculate how long similar incidents took to resolve, and check for repeat attackers.

---

## How everything connects

When an incident gets reported, the agent runs through roughly this flow:

1. Classifies the incident type and severity using past data from incidents_db.csv
2. Checks if any known CVE is involved using cve_data.json
3. Pulls suspicious network activity from network_logs.csv
4. Gets the step-by-step response from playbooks.json
5. Fills in any gaps by searching incident_response_guide.pdf through the RAG pipeline

The output is a complete action plan for the analyst — what to do, in what order, and who handles what.
