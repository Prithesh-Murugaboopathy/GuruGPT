// ChatComponent.jsx
import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig"; // Import your Firestore db
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"; // Firestore methods
import axios from "axios";
import "./ChatComponent.css";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentChat, setCurrentChat] = useState(null);

  useEffect(() => {
    const fetchMessages = () => {
      const unsubscribe = onSnapshot(collection(db, "chats"), (snapshot) => {
        const chatData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(chatData);
        if (chatData.length > 0) {
          setCurrentChat(chatData[0]); // Select the first chat by default
        }
      });

      return () => unsubscribe(); // Clean up subscription
    };

    fetchMessages();
  }, []);

  const handleSend = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Add user message to the current chat
    if (!currentChat || !question.trim()) return;

    const userMessage = { sender: "user", text: question };

    try {
      await addDoc(
        collection(db, "chats", currentChat.id, "messages"),
        userMessage
      );

      // Call your API to get the bot's response
      const res = await axios.post(API_URL, { question });
      const botResponse = { sender: "bot", text: res.data.response };

      // Add bot response to the current chat
      await addDoc(
        collection(db, "chats", currentChat.id, "messages"),
        botResponse
      );

      // Update chat name to the first user message
      await updateChatName(currentChat.id, question);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message.");
    } finally {
      setLoading(false);
      setQuestion(""); // Clear input
    }
  };

  const updateChatName = async (chatId, firstMessage) => {
    await updateDoc(doc(db, "chats", chatId), { name: firstMessage });
  };

  const handleChatDelete = async (chatId) => {
    await deleteDoc(doc(db, "chats", chatId)); // Delete chat
  };

  return (
    <div className="chat_component">
      <div className="chat-content">
        <h1>Chat with the AI</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {messages.map((chat) => (
          <div key={chat.id}>
            <h2>{chat.name || "New Chat"}</h2>
            <div>
              {chat.messages &&
                chat.messages.map((msg, index) => (
                  <p key={index} className={msg.sender}>
                    {msg.text}
                  </p>
                ))}
            </div>
            <button onClick={() => handleChatDelete(chat.id)}>
              Delete Chat
            </button>
          </div>
        ))}
        {loading && <SkeletonLoader />}
      </div>
      <form className="chat-form" onSubmit={handleSend}>
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
