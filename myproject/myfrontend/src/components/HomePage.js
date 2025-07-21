import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import VoiceSection from './VoiceSection';
import GrammarSection from './GrammarSection';
import ImageSection from './ImageSection';
import ChatSection from './ChatSection';
// import HistoryPanel from './HistoryPanel'; // No longer imported

// Helper function to convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

// Real Gemini API call
const callGeminiAPI = async (question, imageFile) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not found');

  let parts = [{ text: question }];
  if (imageFile && imageFile instanceof Blob) {
    const imageBase64 = await convertToBase64(imageFile);
    parts.push({
      inline_data: {
        mime_type: imageFile.type,
        data: imageBase64
      }
    });
  }
  const body = { contents: [ { parts } ] };
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
};

// Voice output
const speakText = (text, lang) => {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    if (lang) utter.lang = lang;
    window.speechSynthesis.speak(utter);
  }
};

const handleStopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="main-container">
      <header className="header">
        <div className="header-logo">
          <span className="ai-text">AI</span>
          <span className="leaning-tool-text">आचार्य</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="main-content">
        <main>
          <VoiceSection 
            callGeminiAPI={callGeminiAPI}
            speakText={speakText}
            handleStopSpeaking={handleStopSpeaking}/>
          <GrammarSection 
            callGeminiAPI={callGeminiAPI}
            speakText={speakText}
            handleStopSpeaking={handleStopSpeaking}
          />
          <ImageSection
            callGeminiAPI={callGeminiAPI}
            speakText={speakText}
            handleStopSpeaking={handleStopSpeaking}
          />
          <ChatSection 
            callGeminiAPI={callGeminiAPI}
            speakText={speakText}
            handleStopSpeaking={handleStopSpeaking}
          />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
