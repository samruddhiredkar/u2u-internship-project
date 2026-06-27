import React, { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cybersecurity Incident Agent</h1>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder="Enter incident details..." 
      />
      <button onClick={handleSubmit}>Submit</button>
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <strong>AI Analysis:</strong> {response}
      </div>
    </div>
  );
}

export default App;