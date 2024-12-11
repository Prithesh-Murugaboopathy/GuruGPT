import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { db } from "../../firebaseConfig";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // Skeleton loader icon
import "./ChatComponent.css";
import {
  AddRounded,
  BlurOnRounded,
  Delete,
  DeleteOutlineRounded,
  SendRounded,
} from "@mui/icons-material";

// Custom Skeleton Loader
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

const API_URL = "http://127.0.0.1:5000/generate"; // Python server endpoint

const ChatComponent = ({
  userId,
  chats,
  selectedChatId, // Use selectedChatId here, not selectedChatID
  onNewChatSelect,
  onCreateNewChat,
  onDeleteChat,
  onSaveChat,
  user,
}) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load messages for the selected chat
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
      // Send the user's question to the Python server
      const response = await axios.post(API_URL, { question });
      const botResponse = { text: response.data.response, sender: "bot" };

      updatedMessages.push(botResponse);
      setMessages(updatedMessages);

      // Save the chat to Firestore
      if (selectedChatId.startsWith("local-")) {
        await onSaveChat(userId, selectedChatId, updatedMessages, question);
      } else {
        const chatRef = doc(db, "users", userId, "chats", selectedChatId);
        await updateDoc(chatRef, {
          messages: updatedMessages,
          title: question,
        });
      }

      setQuestion(""); // Reset input
    } catch (err) {
      console.error("Error communicating with the server:", err);
      setError("Failed to fetch response from the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Get the current chat name
  const currentChat = chats.find((chat) => chat.id === selectedChatId);
  console.log(currentChat);
  const [isExpanded, setIsExpanded] = useState(false);
  const divRef = useRef(null); // To track the div element

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClickOutside = (event) => {
    // Check if the click is outside the expandable div
    if (divRef.current && !divRef.current.contains(event.target)) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="chat_component">
      <div className="chat-header">
        <p className="ChatName">
          {currentChat ? currentChat.title : "What can I help with?"}
        </p>
        <div className="action-buttons">
          <button className="create-chat" onClick={onCreateNewChat}>
            <AddRounded />
            &nbsp; New Chat
          </button>
          {selectedChatId && (
            <button
              className="deleteChat"
              onClick={() => onDeleteChat(selectedChatId)}
            >
              <DeleteOutlineRounded />
            </button>
          )}
        </div>
      </div>

      <div className="chat-content">
        {messages.map((msg, index) => (
          <div
            className={
              msg.sender === "user"
                ? "chat-message user-message-main"
                : "chat-message bot-message-main"
            }
          >
            {msg.sender === "user" ? (
              <img
                src={user?.photoURL || "./default-avatar.png"} // Use default avatar if photoURL is not available
                alt="Profile"
                className="profile-pic-chat"
              />
            ) : (
              <BlurOnRounded className="bot-pic" />
            )}
            &nbsp; &nbsp;
            <div
              key={index}
              className={
                msg.sender === "user"
                  ? "message user-message"
                  : "message bot-message"
              }
            >
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && <SkeletonLoader />}
        {error && <p className="error-message">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className={`chat-form ${isExpanded ? "expanded" : ""}`}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question"
          required
        />
        <button type="submit" disabled={loading} className="sendButton">
          {loading ? (
            <div className="SendButton">
              <SendRounded className="SendIcon" />
              Sending...
            </div>
          ) : (
            <div className="SendButton">
              <SendRounded className="SendIcon" />
              Send Message
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
