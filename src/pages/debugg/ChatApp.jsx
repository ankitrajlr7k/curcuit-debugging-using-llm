// import { useState, useRef, useEffect } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { InferenceEngine, CVImage } from "inferencejs";
// import * as PureImage from "pureimage";
// import "./App.css";
//
//
// const inferEngine = new InferenceEngine();
//
// export default function ChatApp() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [detectionResult, setDetectionResult] = useState(null);
//   const [showDetectionModal, setShowDetectionModal] = useState(false);
//   const [inputEnabled, setInputEnabled] = useState(true);
//   const canvasRef = useRef(null);
//   const chatEndRef = useRef(null);
//
//   const genAI = new GoogleGenerativeAI("YOUR_GOOGLE_GENERATIVE_AI_KEY");
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//
//   const formatTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//
//   const drawPredictionsWithPureImage = async (file, predictions, canvasRef) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return console.error("Canvas not found.");
//
//     try {
//       // Create a new Image object for browser
//       const img = new Image();
//       const imageUrl = URL.createObjectURL(file);
//
//       img.onload = () => {
//         // Set canvas dimensions to match image
//         canvas.width = img.width;
//         canvas.height = img.height;
//
//         const ctx = canvas.getContext('2d');
//
//         // Draw the image
//         ctx.drawImage(img, 0, 0, img.width, img.height);
//
//         // Draw predictions
//         predictions.forEach(({ x, y, width: boxWidth, height: boxHeight, confidence, class: className }) => {
//           const absX = x * img.width;
//           const absY = y * img.height;
//           const absWidth = boxWidth * img.width;
//           const absHeight = boxHeight * img.height;
//
//           // Draw bounding box
//           ctx.strokeStyle = '#FF0000';
//           ctx.lineWidth = 2;
//           ctx.strokeRect(absX - absWidth/2, absY - absHeight/2, absWidth, absHeight);
//
//           // Draw label
//           ctx.fillStyle = '#FF0000';
//           ctx.font = '16px Arial';
//           ctx.fillText(
//             `${className} (${(confidence * 100).toFixed(1)}%)`,
//             absX - absWidth/2,
//             absY - absHeight/2 - 10
//           );
//         });
//       };
//
//       img.src = imageUrl;
//     } catch (error) {
//       console.error("Error drawing predictions:", error);
//     }
//   };
//
//   useEffect(() => {
//     if (image && detectionResult) {
//       drawPredictionsWithPureImage(image, detectionResult.predictions || [], canvasRef);
//     }
//   }, [image, detectionResult]);
//
//   const handleImageUpload = async (file) => {
//     if (!file) return;
//
//     setImage(file);
//     setLoading(true);
//     setInputEnabled(false);
//
//     try {
//       const formData = new FormData();
//       formData.append('image', file);
//
//       // Call Flask backend expecting PNG response
//       const response = await fetch('http://localhost:3001/detect', {
//         method: 'POST',
//         body: formData
//       });
//
//       if (!response.ok) {
//         throw new Error('Detection failed');
//       }
//
//       // Get binary image data
//       const imageBlob = await response.blob();
//       const processedImageUrl = URL.createObjectURL(imageBlob);
//
//       // Set detection result with processed image URL
//       setDetectionResult({
//         processedImageUrl: processedImageUrl
//       });
//
//       setShowDetectionModal(true);
//
//     } catch (error) {
//       console.error("Detection error:", error);
//       setImage(null);
//     } finally {
//       setLoading(false);
//       setInputEnabled(true);
//     }
//   };
//
//   const handleDetectionConfirm = () => {
//     if (!detectionResult) return;
//
//     setShowDetectionModal(false);
//     setInputEnabled(true);
//
//     setMessages((prev) => [
//       ...prev,
//       { text: "Detection results are shown on the image.", image, isUser: false, timestamp: formatTime() },
//     ]);
//   };
//
//   const handleSendMessage = async () => {
//     if (!input) return;
//
//     setMessages((prev) => [...prev, { text: input, image, isUser: true, timestamp: formatTime() }]);
//
//     setLoading(true);
//     try {
//       const analysisMessage = {
//         text: `Analysis result for: ${input}`,
//         isUser: false,
//         timestamp: formatTime(),
//       };
//       setMessages((prev) => [...prev, analysisMessage]);
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setInput("");
//       setLoading(false);
//       chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   };
//
//   return (
//     <div className="chat-container">
//       <header className="chat-header">
//         <h1>AI Crop Disease Consultant</h1>
//         <p>Upload an image and ask questions about plant diseases</p>
//       </header>
//
//       {showDetectionModal && detectionResult && (
//         <div className="detection-modal">
//           <div className="modal-content">
//             <h3>Detection Results</h3>
//             <div className="canvas-container">
//               <img
//                 src={detectionResult.processedImageUrl}
//                 alt="Detection results"
//                 className="detection-canvas"
//               />
//             </div>
//             <div className="modal-buttons">
//               <button onClick={handleDetectionConfirm}>OK</button>
//               <button
//                 onClick={() => {
//                   setImage(null);
//                   setDetectionResult(null);
//                   setShowDetectionModal(false);
//                   setInputEnabled(true);
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//
//       <div className="chat-messages">
//         {messages.map((message, index) => (
//           <div key={index} className={`message ${message.isUser ? "user" : "ai"} fade-in`}>
//             {message.image && (
//               <div className="image-container">
//                 <img src={URL.createObjectURL(message.image)} alt="Uploaded" className="uploaded-image" />
//               </div>
//             )}
//             <div className="message-content">
//               <p>{message.text}</p>
//               <span className="timestamp">{message.timestamp}</span>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="loading-indicator">
//             <div className="typing-dots">
//               <span></span><span></span><span></span>
//             </div>
//           </div>
//         )}
//         <div ref={chatEndRef} />
//       </div>
//
//       <div className="input-container">
//         <div className="file-upload">
//           <label htmlFor="file-input" className="file-label">
//             {image ? "✓ Image Ready" : "📷 Add Image"}
//           </label>
//           <input
//             id="file-input"
//             type="file"
//             accept="image/*"
//             onChange={(e) => handleImageUpload(e.target.files[0])}
//             className="hidden"
//           />
//         </div>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder={inputEnabled ? "Ask about crop diseases..." : "Please confirm detection results..."}
//           className="text-input"
//           disabled={!inputEnabled}
//           onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//         />
//         <button
//           onClick={handleSendMessage}
//           className="send-button"
//           disabled={loading || !inputEnabled}
//         >
//           {loading ? "Sending..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// }
//
//
//
//
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { InferenceEngine } from "inferencejs";
import * as PureImage from "pureimage";
import "./ChatApp.css"

const inferEngine = new InferenceEngine();

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // this stores the original uploaded image
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null); // this stores the processed image
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(true);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);

  const genAI = new GoogleGenerativeAI("AIzaSyBgz4J0HYRz01irawofvnlSCwAPWLTG69k");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const formatTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const drawPredictionsWithPureImage = async (file, predictions, canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return console.error("Canvas not found.");

    try {
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        predictions.forEach(({ x, y, width, height, confidence, class: className }) => {
          const absX = x * img.width;
          const absY = y * img.height;
          const absWidth = width * img.width;
          const absHeight = height * img.height;

          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 2;
          ctx.strokeRect(absX - absWidth / 2, absY - absHeight / 2, absWidth, absHeight);

          ctx.fillStyle = '#FF0000';
          ctx.font = '16px Arial';
          ctx.fillText(`${className} (${(confidence * 100).toFixed(1)}%)`, absX - absWidth / 2, absY - absHeight / 2 - 10);
        });
      };

      img.src = imageUrl;
    } catch (error) {
      console.error("Error drawing predictions:", error);
    }
  };

  useEffect(() => {
    if (image && detectionResult) {
      drawPredictionsWithPureImage(image, detectionResult.predictions || [], canvasRef);
    }
  }, [image, detectionResult]);

  const handleImageUpload = async (file) => {
    if (!file) return;

    setImage(file);
    setLoading(true);
    setInputEnabled(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const imageBlob = await response.blob();
      const processedImageUrl = URL.createObjectURL(imageBlob);

      setDetectionResult({
        processedImageUrl: processedImageUrl, // set the processed image URL
      });

      setShowDetectionModal(true);
    } catch (error) {
      console.error("Detection error:", error);
      setImage(null);
    } finally {
      setLoading(false);
      setInputEnabled(true);
    }
  };

  const handleDetectionConfirm = () => {
    if (!detectionResult) return;

    setShowDetectionModal(false);
    setInputEnabled(true);

    setMessages((prev) => [
      ...prev,
      { text: "DEBUG this circuit", image: detectionResult.processedImageUrl, isUser: false, timestamp: formatTime() },
    ]);
  };

  const handleSendMessage = async () => {
    if (!input && !detectionResult) return;

    // Prepare the message with text and the processed image
    const newMessage = {
      text: input,
      image: detectionResult?.processedImageUrl, // Use processed image URL here
      isUser: true,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setLoading(true);

    let prompt = input || "DEBUG this circuit";

    const context = messages
      .filter((message) => !message.image)
      .map((message) => message.text)
      .join("\n");

    const contentParts = [context, prompt];

    if (detectionResult?.processedImageUrl) {
      // Convert the processed image to Base64 to send in the model request
      const imageBlob = await fetch(detectionResult.processedImageUrl).then((res) => res.blob());
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        reader.onload = () => resolve(reader.result.split(",")[1]); // Get Base64 part
        reader.onerror = (error) => reject(error);
      });

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imageBlob.type,
        },
      };
      contentParts.push(imagePart);
    }

    try {
      const result = await model.generateContent(contentParts);
      const aiMessage = { text: result.response.text(), isUser: false, timestamp: formatTime() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Circuit Helper with integrated object detection</h1>
        <p>Upload an image and ask questions about Circuits</p>
      </header>

      {showDetectionModal && detectionResult && (
        <div className="detection-modal">
          <div className="modal-content">
            <h3>Detection Results</h3>
            <div className="canvas-container">
              <img
                src={detectionResult.processedImageUrl}
                alt="Detection results"
                className="detection-canvas"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handleDetectionConfirm}>OK</button>
              <button
                onClick={() => {
                  setImage(null);
                  setDetectionResult(null);
                  setShowDetectionModal(false);
                  setInputEnabled(true);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? "user" : "ai"} fade-in`}>
            {message.image && (
              <div className="image-container">
                <img src={message.image} alt="Uploaded" className="uploaded-image" />
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
