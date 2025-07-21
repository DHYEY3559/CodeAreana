// src/components/GrammarSection.js
import React, { useState } from 'react';

const GrammarSection = ({ callGeminiAPI, speakText, handleStopSpeaking }) => {
    const [grammarInput, setGrammarInput] = useState('');
    const [grammarResponse, setGrammarResponse] = useState('');

    const handleGrammarCheck = async () => {
        if (!grammarInput) return;
        setGrammarResponse('Analyzing...');
        const prompt = `As an English grammar tutor, analyze this text. Provide corrections and a simple explanation of the tenses used.\n\nText: "${grammarInput}"`;
        try {
            const text = await callGeminiAPI(prompt);
            setGrammarResponse(text);
        } catch (error) {
            setGrammarResponse(error.message);
        }
    };

    return (
        <section className="feature-section">
            <h2 className="feature-title">Tense Guide & Grammar Correction</h2>
            <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Type a sentence here for analysis..."
                value={grammarInput}
                onChange={(e) => setGrammarInput(e.target.value)}
            />
            <button onClick={handleGrammarCheck} className="action-button">Analyze Text</button>
            {grammarResponse && (
                <div className="ai-response-area">
                    <p className="content">{grammarResponse}</p>
                    <div className="response-actions">
                        <button className="response-button" onClick={() => speakText(grammarResponse, 'en-US')}>Speak Response</button>
                        <button className="response-button stop-speak-button" onClick={handleStopSpeaking}>Stop Speaking</button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GrammarSection;