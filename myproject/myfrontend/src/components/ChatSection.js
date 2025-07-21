// src/components/ChatSection.js
import React, { useState, useRef, useEffect } from 'react';

const ChatSection = ({ callGeminiAPI }) => {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([{ sender: 'ai', text: 'Hello! How can I help you today?' }]);
    const chatDisplayRef = useRef(null);

    const handleChatSend = async () => {
        if (!chatInput) return;
        const newHistory = [...chatHistory, { sender: 'user', text: chatInput }];
        setChatHistory(newHistory);
        setChatInput('');
        const conversationContext = newHistory.map(m => `${m.sender === 'ai' ? 'AI' : 'User'}: ${m.text}`).join('\n');
        const prompt = `Continue this conversation:\n\n${conversationContext}\nAI:`;
        try {
            const aiText = await callGeminiAPI(prompt);
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiText }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { sender: 'ai', text: error.message }]);
        }
    };

    useEffect(() => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <section className="feature-section">
            <h2 className="feature-title">Conversational Chat</h2>
            <div ref={chatDisplayRef} className="chat-container">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>
                ))}
            </div>
            <div className="chat-input-area">
                <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Type your message..." 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()} 
                />
                <button onClick={handleChatSend} className="chat-send-button">Send</button>
            </div>
        </section>
    );
};

export default ChatSection;