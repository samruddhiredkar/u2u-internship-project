import React, { useState, useEffect } from 'react';

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]); // New state for history
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load history from backend when the app first starts
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/history")
      .then(res => res.json())
      .then(data => setHistory(data.history))
      .catch(err => console.error("Failed to load history", err));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error("Server failed to respond. Please try again.");
      }

      const data = await res.json();
      setResponse(data.response);
      
      // Refresh history immediately after a successful response
      setHistory([...history, { question: prompt, answer: data.response }]);
    } catch (err) {
      setError("Unable to connect to the AI service. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cybersecurity Incident Agent</h1>
      
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder="Enter incident details..."
        disabled={isLoading}
      />
      
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Submit"}
      </button>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <strong>AI Analysis:</strong> {response}
      </div>

      {/* History Section: Fulfills Task 5 Deliverable */}
      <div style={{ marginTop: '30px' }}>
        <h3>Conversation History</h3>
        {history.map((item, index) => (
          <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9' }}>
            <p><strong>Q:</strong> {item.question}</p>
            <p><strong>A:</strong> {item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
