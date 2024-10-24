// src/Chat.js
import React, { useState } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/chat", {
        question,
      });
      setResponse(res.data.response);
    } catch (error) {
      console.error("Error fetching the response:", error);
    }
  };

  return (
    <div>
      <h1>Chat with GPT-2</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          required
        />
        <button type="submit">Ask</button>
      </form>
      <div>
        <h2>Response:</h2>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default Chat;
