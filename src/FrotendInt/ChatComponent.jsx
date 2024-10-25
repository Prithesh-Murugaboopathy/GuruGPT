import React, { useState } from "react";
import axios from "axios";
import "./Chat.css"; // Ensure you have this CSS file

const API_URL = "http://127.0.0.1:5000/api/chat"; // Update your API URL here

const ChatComponent = () => {
  const [question, setQuestion] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // State to control cursor visibility

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setDisplayedResponse("");
    setIsTyping(true); // Show the cursor

    try {
      const res = await axios.post(API_URL, { question });
      const responseText = res.data.response;

      console.log("Response received:", responseText); // Debugging: Log response text

      // Start typewriter effect after response is fetched
      typeWriterEffect(responseText);
    } catch (error) {
      console.error("Error fetching data from the API", error);
    } finally {
      setLoading(false);
    }
  };

  const typeWriterEffect = (text) => {
    let index = 1; // Start from the second character
    const speed = 50; // Typing speed

    // Directly set the first character
    setDisplayedResponse(text.charAt(0));

    // Continue with the typewriter effect
    const typeInterval = setInterval(() => {
      setDisplayedResponse((prev) => prev + text.charAt(index));
      index++;

      if (index >= text.length) {
        clearInterval(typeInterval);
        setIsTyping(false); // Stop cursor when typing is done
      }
    }, speed);
  };

  return (
    <div>
      <h1>Chat with the AI</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question"
          required
        />
        <button type="submit">Send</button>
      </form>
      {loading ? (
        <div className="loading-dot"></div>
      ) : (
        <div>
          <h2>Response:</h2>
          <p>
            {displayedResponse}
            {isTyping && <span className="blinking-block-cursor"></span>}{" "}
            {/* Block cursor */}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
