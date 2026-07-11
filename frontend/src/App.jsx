import React, { useState, useEffect } from 'react';

// Use the environment variable or the hardcoded Render URL
const API_BASE_URL = "https://u2u-internship-project.onrender.com";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load history from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/history`)
      .then(res => res.json())
      .then(data => setHistory(data.history))
      .catch(err => console.error("Failed to load history", err));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error("Server failed to respond. Please try again.");
      }

      const data = await res.json();
      setResponse(data.response);
      
      setHistory([...history, { question: prompt, answer: data.response }]);
    } catch (err) {
      setError("Unable to connect to the AI service. Please check your internet connection.");
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
        style={{ width: '100%', height: '100px', marginBottom: '10px' }}
      />
      
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Submit"}
      </button>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <strong>AI Analysis:</strong> {response}
      </div>

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
