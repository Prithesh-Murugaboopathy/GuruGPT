import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../../firebaseConfig";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import "./ChatComponent.css";

const API_URL = "http://127.0.0.1:5000/api/chat";

const SkeletonLoader = () => (
  <div className="skeleton-loader">
    <AutoAwesomeIcon className="skeleton_icon" />
    <div className="skeleton-div">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  </div>
);

const ChatComponent = ({
  userId,
  chats,
  selectedChatId,
  onNewChatSelect,
  onCreateNewChat,
  onDeleteChat,
  onSaveChat,
}) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChatId) return;

    if (selectedChatId.startsWith("local-")) {
      setMessages([]);
    } else {
      const unsubscribe = onSnapshot(
        doc(db, "users", userId, "chats", selectedChatId),
        (doc) => {
          if (doc.exists()) {
            setMessages(doc.data().messages || []);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [selectedChatId, userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const userMessage = { text: question, sender: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const res = await axios.post(API_URL, { question });
      const botResponse = { text: res.data.response, sender: "bot" };
      updatedMessages.push(botResponse);
      setMessages(updatedMessages);

      if (selectedChatId.startsWith("local-")) {
        await onSaveChat(userId, selectedChatId, updatedMessages, question);
      } else {
        const chatRef = doc(db, "users", userId, "chats", selectedChatId);
        await updateDoc(chatRef, {
          messages: updatedMessages,
          title: question,
        });
      }

      setQuestion("");
    } catch (error) {
      console.error("Error fetching data from the API", error);
      setError("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat_component">
      <div className="chat-header">
        <h1 style={{ fontFamily: "calibri" }}>
          {selectedChatId ? `Guru GPT` : "Select a Chat"}
        </h1>
        <button onClick={onCreateNewChat}>Create New Chat</button>
        <select
          onChange={(e) => onNewChatSelect(e.target.value)}
          value={selectedChatId || ""}
        >
          <option value="" disabled>
            Select Chat
          </option>
          {chats.map((chat) => (
            <option key={chat.id} value={chat.id}>
              {chat.title || "New Chat"}
            </option>
          ))}
        </select>
        {selectedChatId && (
          <button onClick={() => onDeleteChat(selectedChatId)}>
            Delete Chat
          </button>
        )}
      </div>
      <div className="chat-content">
        {error && <p style={{ color: "red" }}>{error}</p>}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === "user"
                ? "message user-message"
                : "message bot-message"
            }
          >
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && <SkeletonLoader />}
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
