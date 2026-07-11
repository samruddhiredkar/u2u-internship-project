import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = "https://u2u-internship-project.onrender.com";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
    body: { backgroundColor: '#0f172a', color: '#e2e8f0', minHeight: '100vh', fontFamily: 'sans-serif', lineHeight: '1.6' },
    card: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '20px' },
    textarea: { width: '100%', height: '120px', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '8px', padding: '12px', fontSize: '16px', boxSizing: 'border-box' },
    button: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', width: '100%' },
    historyItem: { borderLeft: '4px solid #3b82f6', marginBottom: '15px', backgroundColor: '#334155', padding: '15px', borderRadius: '4px' }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/history`)
      .then(res => res.json())
      .then(data => setHistory(data.history))
      .catch(err => console.error("Failed to load history", err));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setResponse(data.response);
      setHistory([...history, { question: prompt, answer: data.response }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={{ color: '#60a5fa', textAlign: 'center' }}>// CYBER-INCIDENT-AGENT</h1>
        <div style={styles.card}>
          <textarea style={styles.textarea} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter system log..." disabled={isLoading} />
          <button style={styles.button} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "ANALYZING..." : "INITIATE ANALYSIS"}
          </button>
        </div>
        <div style={styles.card}>
          <h3 style={{ color: '#34d399', marginTop: '0' }}>[ AI ANALYSIS OUTPUT ]</h3>
          <ReactMarkdown>{response || "Waiting for input..."}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default App;
