import React, { useState, useEffect } from 'react';

const API_BASE_URL = "https://u2u-internship-project.onrender.com";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const styles = {
    body: { backgroundColor: '#0f172a', color: '#e2e8f0', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '20px' },
    textarea: { width: '100%', height: '120px', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '8px', padding: '10px', fontSize: '16px', boxSizing: 'border-box' },
    button: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
    historyItem: { borderLeft: '4px solid #3b82f6', marginBottom: '15px', backgroundColor: '#334155', padding: '10px', borderRadius: '4px' }
  };

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

      if (!res.ok) throw new Error("Server failed to respond.");

      const data = await res.json();
      setResponse(data.response);
      setHistory([...history, { question: prompt, answer: data.response }]);
    } catch (err) {
      setError("Unable to connect to the AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <h1 style={{ color: '#60a5fa' }}>// CYBER-INCIDENT-AGENT</h1>
      
      <div style={styles.card}>
        <textarea 
          style={styles.textarea} 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Enter system log or incident description..."
          disabled={isLoading}
        />
        <button style={styles.button} onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "RUNNING ANALYSIS..." : "INITIATE ANALYSIS"}
        </button>
        {error && <div style={{ color: '#f87171', marginTop: '10px' }}>{error}</div>}
      </div>

      <div style={styles.card}>
        <h3 style={{ color: '#34d399' }}>[ AI ANALYSIS OUTPUT ]</h3>
        <p>{response || "Waiting for input..."}</p>
      </div>

      <h3>[ PREVIOUS INCIDENTS ]</h3>
      {history.map((item, index) => (
        <div key={index} style={styles.historyItem}>
          <p><strong>Query:</strong> {item.question}</p>
          <p><strong>Result:</strong> {item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
