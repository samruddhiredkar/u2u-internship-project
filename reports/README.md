## Error Response Documentation

The `/api/chat` endpoint implements robust error checking to handle exceptional conditions smoothly without breaking the system workflow.

### 1. HTTP 400 Bad Request (Missing Parameters / Invalid Requests)
* **Condition:** Triggered when a user submits an empty text box or whitespace-only inputs.
* **JSON Response Structure:**
  ```json
  {
    "detail": "Prompt required. Request payload cannot be empty."
  }
