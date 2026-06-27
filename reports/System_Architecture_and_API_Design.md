# System Architecture & API Specification
**Project:** AI Agent for Cybersecurity Incident Response
**Phase:** Week 3 - Design & Develop

## 1. AI Client-Server Architecture (Task 1)
Our system utilizes a decoupled, four-tier client-server architecture designed for high throughput, low latency, and modular scalability.

* **Client Layer (Frontend):** A Single Page Application (SPA) built with React. It handles state management for active incident analysis, displays asynchronous loading states during RAG processing, and captures analyst prompts via a chat-based UI.
* **Server Layer (Backend REST API):** Developed using Python and FastAPI. This layer acts as the orchestrator. It handles CORS management, request validation (via Pydantic schemas), query routing, and business logic execution.
* **AI Model Layer (RAG Engine):** Integrates directly with the Server Layer. It parses the context from `incident_response_guide.pdf`, cross-references structural JSON rules (`playbooks.json`, `cve_data.json`), and generates actionable remediation steps.
* **Database Layer (Storage):** A local SQLite relational database (`incident_response.db`). It stores structured historical incident records (`incidents` table) and netflow patterns (`network_logs` table) for real-time querying by the backend.

### Architecture Diagram (ASCII)
```text
[ React Frontend ]  <-- JSON over HTTP/REST -->  [ FastAPI Backend ]
  (Client Layer)                                   (Server Layer)
                                                         |
                                        +----------------+----------------+
                                        |                                 |
                               [ AI Model Layer ]               [ Database Layer ]
                             (RAG, JSON Playbooks)             (SQLite: incident_response.db)