import React, { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New: Track loading
  const [error, setError] = useState(""); // New: Track errors

  const handleSubmit = async () => {
    // Reset states before new request
    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      // If server returns an error (e.g., 500), throw an exception
      if (!res.ok) {
        throw new Error("Server failed to respond. Please try again.");
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      // Handle connection errors or server failures
      setError("Unable to connect to the AI service. Is the backend running?");
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cybersecurity Incident Agent</h1>
      
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder="Enter incident details..."
        disabled={isLoading} // Disable input while loading
      />
      
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Submit"}
      </button>

      {/* Show Error Message if one exists */}
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      {/* Show Response */}
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <strong>AI Analysis:</strong> {response}
      </div>
    </div>
  );
}

export default App;
