// src/components/VoiceSection.js
import React, { useState, useRef, useEffect } from 'react';

const VoiceSection = ({ callGeminiAPI, speakText, handleStopSpeaking }) => {
    const [statusText, setStatusText] = useState('Click "Start Recording" to speak');
    const [isListening, setIsListening] = useState(false);
    const [englishResponse, setEnglishResponse] = useState('');
    const [translatedResponse, setTranslatedResponse] = useState('');
    const [voiceLanguage, setVoiceLanguage] = useState('en-US');
    const [aiRole, setAiRole] = useState('pronunciation coach who provides phonetic breakdowns');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setStatusText('Speech Recognition not supported.');
            return;
        }
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setStatusText(`You said: "${transcript}"`);
            setEnglishResponse('AI is thinking...');
            setTranslatedResponse('');
            let basePrompt;
            const pronunciationRoleValue = "pronunciation coach who provides phonetic breakdowns";
            if (aiRole === pronunciationRoleValue) {
                basePrompt = `You are a pronunciation coach. The user said: "${transcript}". Provide a simple phonetic breakdown.`;
            } else {
                basePrompt = `You are a ${aiRole}. The user said: "${transcript}". Respond concisely in English.`;
            }
            const languageSelect = document.getElementById('voice-language');
            const targetLangName = languageSelect.options[languageSelect.selectedIndex].text.split(' (')[0];
            const finalPrompt = `${basePrompt}\n\nAfter your response, write '---' as a separator, then translate your English response into ${targetLangName}.`;
            try {
                const aiResponseText = await callGeminiAPI(finalPrompt);
                const parts = aiResponseText.split('---');
                setEnglishResponse(parts[0].trim());
                setTranslatedResponse(parts[1] ? parts[1].trim() : "Translation not available.");
            } catch (error) {
                setEnglishResponse(`Error: ${error.message}`);
            }
        };
        recognition.onerror = (event) => setStatusText(`Error: ${event.error}`);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
    }, [aiRole, callGeminiAPI]);

    const handleStartRecording = () => {
        if (recognitionRef.current && !isListening) {
            setEnglishResponse('');
            setTranslatedResponse('');
            recognitionRef.current.start();
        }
    };
    const handleStopRecording = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return (
        <section className="hero-section">
            <div className="aurora-glow aurora-glow-1"></div>
            <div className="aurora-glow aurora-glow-2"></div>
            <h1 className="hero-title">Speak and Learn <br /> Effortlessly</h1>
            <div className="controls-container">
                <div className="select-wrapper">
                    <label htmlFor="voice-language">Translate & Speak In:</label>
                    <select id="voice-language" className="input-field" value={voiceLanguage} onChange={(e) => setVoiceLanguage(e.target.value)}>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Spanish (Spain)</option>
                        <option value="fr-FR">French (France)</option>
                        <option value="de-DE">German (Germany)</option>
                        <option value="ja-JP">Japanese (Japan)</option>
                        <option value="zh-CN">Mandarin (China)</option>
                        <option value="hi-IN">Hindi (India)</option>
                        <option value="gu-IN">Gujarati (India)</option>
                    </select>
                </div>
                <div className="select-wrapper">
                    <label htmlFor="ai-role">AI Role:</label>
                    <select id="ai-role" className="input-field" value={aiRole} onChange={(e) => setAiRole(e.target.value)}>
                        <option value="pronunciation coach who provides phonetic breakdowns">Pronunciation Coach</option>
                        <option value="Friendly Language Companion">Friendly Language Companion</option>
                        <option value="Strict Grammar Teacher">Strict Grammar Teacher</option>
                    </select>
                </div>
            </div>
            <div className="mic-button-container">
                {!isListening ? (
                    <button className="mic-button" onClick={handleStartRecording}>Start Recording</button>
                ) : (
                    <button className="stop-button" onClick={handleStopRecording}>Stop Recording</button>
                )}
            </div>
            <p className="voice-output-text">{statusText}</p>
            {englishResponse && (
                <div className="ai-response-area">
                    <p className="content">{englishResponse}</p>
                    {translatedResponse && (
                        <div className="translation-box">
                            <p className="content translated-text">{translatedResponse}</p>
                            <div className="response-actions">
                                <button className="response-button" onClick={() => speakText(translatedResponse, voiceLanguage)}>Speak Translation</button>
                                <button className="response-button stop-speak-button" onClick={handleStopSpeaking}>Stop Speaking</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default VoiceSection;