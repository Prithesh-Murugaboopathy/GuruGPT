import React, { useState } from "react";
import axios from "axios";
import "./Chat.css"; // Ensure you have this CSS file

const API_URL = "http://127.0.0.1:5000/api/chat"; // Update your API URL here

const ChatComponent = () => {
  const [question, setQuestion] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false); // State to control cursor visibility

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setDisplayedResponse("");
    setCursorVisible(true); // Show the cursor when typing starts

    try {
      const res = await axios.post(API_URL, { question });
      const responseText = res.data.response;

      console.log("Response received:", responseText); // Debugging: Log response text

      // Start typewriter effect after response is fetched
      typeWriterEffect(responseText);
    } catch (error) {
      console.error("Error fetching data from the API", error);
      setDisplayedResponse("Server not responding at the moment.");
      setCursorVisible(false); // Hide cursor in case of an error
    } finally {
      setLoading(false);
    }
  };

  const typeWriterEffect = (text) => {
    let index = 1; // Start from the second character
    setDisplayedResponse(text.charAt(0)); // Set the first character immediately

    const typeInterval = setInterval(() => {
      setDisplayedResponse((prev) => prev + text.charAt(index));
      index++;

      if (index >= text.length) {
        clearInterval(typeInterval);
        setCursorVisible(false); // Hide cursor after typing
      }
    }, 100); // Adjust typing speed as needed

    // Fade in the cursor at the start of typing
    setCursorVisible(true);
    setTimeout(() => {
      setCursorVisible(false); // Fade out after typing
    }, text.length * 100 + 500); // Wait for typing to complete + extra delay
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
        <div className="response-container">
          <h2>Response:</h2>
          <p
            className={
              displayedResponse === "Server not responding at the moment."
                ? "error-message"
                : "response-text"
            }
          >
            {displayedResponse}
          </p>
          {cursorVisible && (
            <span className="blinking-round-cursor"></span> // Show the cursor
          )}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
