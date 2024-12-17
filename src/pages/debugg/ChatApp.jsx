import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./ChatApp.css"; // The provided CSS file will be used

export default function ChatApp() {
  const [messages, setMessages] = useState([]); // Store chat messages
  const [input, setInput] = useState(""); // User input
  const [image, setImage] = useState(null); // Uploaded image
  const [loading, setLoading] = useState(false); // Loading state
  const chatEndRef = useRef(null);

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI("AIzaSyBgz4J0HYRz01irawofvnlSCwAPWLTG69k"); // Replace with your Gemini API Key
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async () => {
    if (!input && !image) return; // Ensure at least text or image is sent

    const newMessage = {
      text: input,
      image,
      isUser: true,
      timestamp: formatTime()
    };
    setMessages((prev) => [...prev, newMessage]);

    // Clear input fields
    setInput("");
    setImage(null);

    // Prepare the prompt and image part
    const prompt = input || "Analyze this imagege and help me with modifications";
    const contentParts = [prompt];

    if (image) {
      // Convert file to Base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: image.type,
        },
      };
      contentParts.push(imagePart);
    }

    // Send request to Gemini API
    setLoading(true);
    try {
      const result = await model.generateContent(contentParts);
      const aiMessage = { text: result.response.text(), isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
    }
    setLoading(false);

    // Scroll to the latest message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Circuit Debugging</h1>
        <p>Upload an image and ask questions about modifications</p>
      </header>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.isUser ? "user" : "ai"} fade-in`}
          >
            {message.image && (
              <div className="image-container">
                <img
                  src={URL.createObjectURL(message.image)}
                  alt="Uploaded"
                  className="uploaded-image"
                />
              </div>
            )}
            <div className="message-content">
              <p>{message.text}</p>
              <span className="timestamp">{message.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="loading-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
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
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about crop diseases..."
          className="text-input"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="send-button"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
