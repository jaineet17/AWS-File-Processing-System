import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !inputText) {
      setError('Please provide both text input and a file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const fileContent = await file.text();
      
      const payload = {
        inputText: inputText,
        fileContent: fileContent
      };

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not defined. Please set REACT_APP_API_URL environment variable.');
      }

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setResponse(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>File Processing System</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="inputText">Text Input:</label>
            <input
              type="text"
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="fileInput">File Input:</label>
            <input
              type="file"
              id="fileInput"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
        {response && (
          <div className="response">
            <h2>Response:</h2>
            <pre>{response}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
