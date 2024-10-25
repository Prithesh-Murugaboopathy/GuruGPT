import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/chat"; // Update your API URL here

const ChatComponent = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    try {
      const res = await axios.post(API_URL, { question });
      setResponse(res.data.response); // Set the response to state
      console.log(res.data.response); // Log the response for debugging
    } catch (error) {
      console.error("Error fetching data from the API", error);
    }
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
      {response && (
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
