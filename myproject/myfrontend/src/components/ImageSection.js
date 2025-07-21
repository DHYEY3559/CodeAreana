import React, { useState, useRef, useEffect, useCallback } from 'react';

const ImageSection = ({ callGeminiAPI, speakText, handleStopSpeaking }) => {
    // State hooks
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageQuestion, setImageQuestion] = useState('');
    const [imageResponse, setImageResponse] = useState('');
    const [translatedResponse, setTranslatedResponse] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [stream, setStream] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('en');

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const availableLanguages = [
        { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
        { code: 'hi', name: 'Hindi' }, { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' }, { code: 'zh', name: 'Chinese (Simplified)' },
    ];

    // Resets all image/question/response related states
    const resetImageAndResponse = useCallback(() => {
        setImageFile(null);
        setImagePreview('');
        setImageResponse('');
        setTranslatedResponse('');
        setImageQuestion('');
        setError('');
    }, []);

    // Gets available cameras
    const getCameras = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameras(videoDevices);
            if (videoDevices.length > 0 && !selectedCamera) {
                setSelectedCamera(videoDevices[0].deviceId);
            }
        } catch (err) {
            setError("Could not access camera devices.");
        }
        // eslint-disable-next-line
    }, [selectedCamera]); // It's okay to keep selectedCamera here for linter happiness

    // Fetch camera list when camera is opened (do not put getCameras in deps, use useCallback)
    useEffect(() => {
        if (isCameraOpen) getCameras();
    }, [isCameraOpen, getCameras]);

    // Close camera stream and reset
    const handleCloseCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsCameraOpen(false);
        setIsCameraReady(false);
        // eslint-disable-next-line
    }, [stream]);

    // Open/fetch camera with selected device
    const handleOpenCamera = useCallback(async () => {
        resetImageAndResponse();
        setIsCameraReady(false);
        setError('');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Your browser does not support camera access.");
            return;
        }
        try {
            const constraints = selectedCamera
                ? { video: { deviceId: { exact: selectedCamera } } }
                : { video: true };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            setIsCameraOpen(true);
        } catch (err) {
            setError(`Error opening camera: ${err.message}`);
            handleCloseCamera();
        }
        // eslint-disable-next-line
    }, [selectedCamera, resetImageAndResponse, handleCloseCamera]);

    // --- Setup/teardown video stream to videoRef on stream start/stop
    useEffect(() => {
        if (isCameraOpen && stream && videoRef.current) {
            const video = videoRef.current;
            const handleCanPlay = () => setIsCameraReady(true);
            video.srcObject = stream;
            video.addEventListener('canplay', handleCanPlay);

            return () => {
                video.removeEventListener('canplay', handleCanPlay);
                if (video.srcObject) {
                    video.srcObject.getTracks().forEach(track => track.stop());
                    video.srcObject = null;
                }
                setIsCameraReady(false);
            };
        }
    }, [isCameraOpen, stream]);

    // If camera is open and selectedCamera changes, re-open the camera
    useEffect(() => {
        if (isCameraOpen && stream) {
            // Only if not the same camera
            const oldTrack = stream.getVideoTracks()[0];
            if (!oldTrack || oldTrack.getSettings().deviceId !== selectedCamera) {
                handleCloseCamera();
                handleOpenCamera();
            }
        }
        // eslint-disable-next-line
    }, [selectedCamera]); // Don't add handleOpenCamera to deps, it is memoized

    // Cleanup camera stream on component unmount
    useEffect(() => {
        return () => handleCloseCamera();
        // eslint-disable-next-line
    }, []); // run once

    // --- capture photo ---
    const handleTakePhoto = () => {
        if (!isCameraReady || !videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) {
            setError("Camera is not active or ready. Please try again.");
            return;
        }
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], "camera_photo.png", { type: "image/png" });
                resetImageAndResponse();
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                handleCloseCamera();
            } else {
                setError("Failed to capture image from camera.");
            }
        }, 'image/png');
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleCloseCamera();
            resetImageAndResponse();
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Language translation (mocked, replace with real logic for actual translation)
    const translateText = useCallback(async (text, targetLang) => {
        if (!text || targetLang === 'en') return text;
        setIsTranslating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            return `[${targetLang.toUpperCase()} Translation] ${text}`;
        } catch (err) {
            setError(`Translation failed: ${err.message}`);
            return text;
        } finally {
            setIsTranslating(false);
        }
    }, []);

    // Handles: submitting a question about the image
    const handleImageQuestion = useCallback(async () => {
        if (!imageFile || !imageQuestion.trim()) {
            setError(!imageFile ? 'Please upload an image first.' : 'Please ask a question.');
            return;
        }
        setError('');
        setIsAnalyzing(true);
        setImageResponse('Analyzing image...');
        setTranslatedResponse('');
        try {
            const geminiText = await callGeminiAPI(imageQuestion, imageFile);
            setImageResponse(geminiText);
        } catch (err) {
            setError(`Failed to get response from AI: ${err.message}`);
            setImageResponse('');
        } finally {
            setIsAnalyzing(false);
        }
    }, [imageFile, imageQuestion, callGeminiAPI]);

    // Translate when response or language changes
    useEffect(() => {
        if (!imageResponse || imageResponse === 'Analyzing image...' || isAnalyzing) return;
        let cancelled = false;
        const doTranslation = async () => {
            const translated = await translateText(imageResponse, targetLanguage);
            if (!cancelled) setTranslatedResponse(translated);
        };
        doTranslation();
        return () => { cancelled = true; };
    }, [imageResponse, targetLanguage, isAnalyzing, translateText]);

    // --- FULL AND CORRECT JSX RETURN BLOCK ---
    return (
        <section className="feature-section">
            <h2 className="feature-title">Image Understanding & Answering</h2>

            <div className="input-group">
                <label className="file-input-label">
                    {imageFile ? imageFile.name : "Choose an Image"}
                    <input
                        type="file"
                        className="file-input-hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </label>
                <button
                    onClick={isCameraOpen ? handleCloseCamera : handleOpenCamera}
                    className={`action-button camera-button ${isCameraOpen ? 'close-camera' : ''}`}
                >
                    {isCameraOpen ? 'Close Camera' : 'Take Photo'}
                </button>
            </div>

            {isCameraOpen && (
                <div className="camera-container">
                    {cameras.length > 1 && (
                        <select
                            onChange={e => setSelectedCamera(e.target.value)}
                            value={selectedCamera}
                            className="camera-select"
                            disabled={!isCameraOpen}
                        >
                            {cameras.map(camera => (
                                <option key={camera.deviceId} value={camera.deviceId}>
                                    {camera.label || `Camera ${camera.deviceId.substring(0, 8)}`}
                                </option>
                            ))}
                        </select>
                    )}
                    <video ref={videoRef} autoPlay muted playsInline className="camera-feed"></video>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    <button
                        onClick={handleTakePhoto}
                        className="action-button take-photo-button"
                        disabled={!isCameraReady}
                    >
                        {isCameraReady ? 'Capture Photo' : 'Loading Camera...'}
                    </button>
                </div>
            )}

            {imagePreview && (
                <div className="image-preview-container">
                    <img src={imagePreview} alt="Upload preview" className="image-preview" />
                    <button className="clear-image-button" onClick={resetImageAndResponse}>
                        Clear Image
                    </button>
                </div>
            )}

            <div className="language-selector-container">
                <label htmlFor="language-select">Translate Response to:</label>
                <select
                    id="language-select"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="language-select"
                >
                    {availableLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                className="input-field"
                rows={2}
                placeholder="Ask a question about the image..."
                value={imageQuestion}
                onChange={e => setImageQuestion(e.target.value)}
                disabled={isAnalyzing || !imageFile}
            />
            <button
                onClick={handleImageQuestion}
                className="action-button"
                disabled={isAnalyzing || !imageFile || !imageQuestion.trim()}
            >
                {isAnalyzing ? 'Analyzing...' : 'Ask AI'}
            </button>

            {error && <p className="error-message">{error}</p>}

            {(imageResponse && imageResponse !== 'Analyzing image...') && (
                <div className="ai-response-area">
                    <p className="content">
                        {isTranslating ? 'Translating...' : translatedResponse}
                    </p>
                    <div className="response-actions">
                        <button
                            className="response-button"
                            onClick={() => speakText(translatedResponse, targetLanguage)}
                            disabled={isAnalyzing || isTranslating || !translatedResponse}
                        >
                            Speak
                        </button>
                        <button
                            className="response-button stop-speak-button"
                            onClick={handleStopSpeaking}
                        >
                            Stop
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ImageSection;
