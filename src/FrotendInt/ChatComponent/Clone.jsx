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
  onSaveChat,
}) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedChatId && !selectedChatId.startsWith("local-")) {
      const unsubscribe = onSnapshot(
        doc(db, "users", userId, "chats", selectedChatId),
        (doc) => {
          if (doc.exists()) {
            setMessages(doc.data().messages || []);
          }
        }
      );
      return () => unsubscribe();
    } else {
      setMessages([]); // Clear messages for a new local chat
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
        // Save the new chat to Firestore
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
        <h1>{selectedChatId ? `Chat: ${selectedChatId}` : "Select a Chat"}</h1>
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
// import React, { useEffect, useState } from "react";
// import { auth, db } from "./firebaseConfig";
// import { onAuthStateChanged } from "firebase/auth";
// import { collection, getDocs, addDoc } from "firebase/firestore";
// import Login from "./Login";
// import SignUpComponent from "./SignUp";
// import Header from "./FrotendInt/Header/Header";
// import ChatComponent from "./FrotendInt/ChatComponent/ChatComponent";

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [chats, setChats] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         await loadOrCreateChat(currentUser.uid);
//       } else {
//         setChats([]);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const loadOrCreateChat = async (userId) => {
//     const chatsRef = collection(db, "users", userId, "chats");
//     const snapshot = await getDocs(chatsRef);
//     const chatsList = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     if (chatsList.length > 0) {
//       setChats(chatsList);
//       setSelectedChat(chatsList[0].id);
//     } else {
//       await createNewChat(userId); // Automatically create a new chat if none exists
//     }
//   };

//   const createNewChat = async (userId) => {
//     const newChat = {
//       id: `local-${Date.now()}`,
//       title: "New Chat",
//       messages: [],
//     };
//     setChats((prevChats) => [...prevChats, newChat]);
//     setSelectedChat(newChat.id);
//   };

//   const handleCreateNewChat = () => {
//     const newChatExists = chats.some((chat) => chat.title === "New Chat");

//     if (!newChatExists) {
//       createNewChat(user.uid);
//     } else {
//       alert(
//         "You already have a 'New Chat' open. Please use it or rename it to create another."
//       );
//     }
//   };

//   const saveChatToDb = async (userId, chatId, messages, title) => {
//     if (chatId.startsWith("local-")) {
//       const chatData = { messages, title };
//       const chatDoc = await addDoc(
//         collection(db, "users", userId, "chats"),
//         chatData
//       );
//       const newChatId = chatDoc.id;

//       setChats((prevChats) =>
//         prevChats.map((chat) =>
//           chat.id === chatId ? { ...chat, id: newChatId, title } : chat
//         )
//       );
//       setSelectedChat(newChatId);
//     }
//   };

//   return (
//     <>
//       {!user ? (
//         <div>
//           <Login />
//           <SignUpComponent />
//         </div>
//       ) : (
//         <div>
//           <Header />
//           <ChatComponent
//             userId={user.uid}
//             chats={chats}
//             selectedChatId={selectedChat}
//             onNewChatSelect={setSelectedChat}
//             onCreateNewChat={handleCreateNewChat}
//             onSaveChat={saveChatToDb}
//           />
//         </div>
//       )}
//     </>
//   );
// };

// export default App;
