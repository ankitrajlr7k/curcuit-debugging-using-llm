import { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./upload.css";

export default function Upload() {
  // State variables
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(true);
  const [ocrText, setOcrText] = useState("");
  const chatEndRef = useRef(null);

  const genAI = new GoogleGenerativeAI("AIzaSyBgz4J0HYRz01irawofvnlSCwAPWLTG69k");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add text formatting helper
  const formatDetectionText = (text) => {
    if (!text) return '';

    // Convert markdown headers and clean up
    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>')  // Convert **text** to <h3>
      .replace(/\* /g, '• ')  // Convert markdown bullets to bullet points
      .replace(/#{1,6}\s/g, '')  // Remove markdown headers
      .replace(/\n{3,}/g, '\n\n');  // Normalize line breaks

    // Split into sections based on headers
    const sections = cleanText.split('<h3>').filter(Boolean);

    // Format each section
    const formattedSections = sections.map((section, index) => {
      const title = section.split('</h3>')[0];
      const content = section.split('</h3>')[1] || '';

      if (title && content) {
        return `${index + 1}. ${title}\n${content.trim()}`;
      }
      return section.trim();
    });

    return formattedSections.join('\n\n');
  };

  // Add helper function for API calls
  const sendAnalysisRequest = async (imageData, detectionText, userPrompt) => {
    const formattedText = formatDetectionText(detectionText);

    const combinedPrompt = `
Analysis Results:
${formattedText}

User Question: ${userPrompt}`.trim();

    const result = await model.generateContent([combinedPrompt]);
    return {
      text: result.response.text(),
      isUser: false,
      timestamp: formatTime()
    };
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setImage(file);
    setLoading(true);
    setInputEnabled(false);

    const formData = new FormData();
    formData.append("file", file); // Changed from 'image' to 'file'

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,

      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log("Detection result:", data.text); // Debug log

      setDetectionResult(data);
      setShowDetectionModal(true);
    } catch (error) {
      console.error("Error:", error);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  // Update detection confirm handler
  const handleDetectionConfirm = async () => {
    if (!detectionResult?.text) return;

    setShowDetectionModal(false);
    setInputEnabled(true);

    const formattedText = formatDetectionText(detectionResult.text);
    const detectionMessage = {
      text: `Detection Results:\n${formattedText}`,
      image,
      isUser: false,
      timestamp: formatTime(),
    };
    setMessages(prev => [...prev, detectionMessage]);
  };

  // Update message handler
  const handleSendMessage = async () => {
    if (!input) return;

    // Add user message
    const userMessage = {
      text: input,
      image,
      isUser: true,
      timestamp: formatTime(),
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(true);
    try {
      // Send combined analysis
      const analysisMessage = await sendAnalysisRequest(
        image,
        detectionResult?.text || "",
        input
      );

      // Ensure `analysisMessage.text` is used for string operations
      let formattedText = analysisMessage.text.replace(/\*\*(.*?)\*\*/g, '<h1>$1</h1>'); // Convert Markdown headers to <h1>
      formattedText = formattedText.replace(/^\* (.*?)$/gm, '<li>$1</li>'); // Convert Markdown bullets to <li>
      formattedText = formattedText.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>'); // Wrap <li> in <ul>

      // Create a message object and update state
      const aiMessage = {
        text: formattedText,
        isUser: false,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
    }

    finally {
      setInput("");
      setLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Circuit Helper with integrated OCR</h1>
        <p>Upload an image and ask questions about circuit</p>
      </header>

      {showDetectionModal && detectionResult && (
        <div className="detection-modal">
          <div className="modal-content">
            <h3>Detection Results</h3>
            <div className="detection-results">
              <p>Detected Info from OCR:</p>
              <ul>
                {Object.entries(detectionResult || {}).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </div>
            <div className="modal-buttons">
              <button onClick={handleDetectionConfirm}>OK</button>
              <button onClick={() => {
                setImage(null);
                setDetectionResult(null);
                setShowDetectionModal(false);
                setInputEnabled(true);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? "user" : "ai"} fade-in`}>
            {message.image && (
              <div className="image-container">
                <img src={URL.createObjectURL(message.image)} alt="Uploaded" className="uploaded-image" />
              </div>
            )}
            <div className="message-content">
              <div dangerouslySetInnerHTML={{ __html: message.text }} />
              <span className="timestamp">{message.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="loading-indicator">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-container">
        <div className="file-upload">
          <label htmlFor="file-input" className="file-label">
            {image ? "✓ Image Ready" : "📷 Add Image"}
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputEnabled ? "Ask about crop diseases..." : "Please confirm detection results..."}
          className="text-input"
          disabled={!inputEnabled}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="send-button"
          disabled={loading || !inputEnabled}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

