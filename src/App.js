import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc, // Add this line
} from "firebase/firestore";

import Login from "./Login";
import SignUpComponent from "./SignUp";
import Header from "./FrotendInt/Header/Header";
import ChatComponent from "./FrotendInt/ChatComponent/ChatComponent";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadOrCreateChat(currentUser.uid);
      } else {
        setChats([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadOrCreateChat = async (userId) => {
    const chatsRef = collection(db, "users", userId, "chats");
    const snapshot = await getDocs(chatsRef);
    const chatsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (chatsList.length > 0) {
      setChats(chatsList);
      setSelectedChat(chatsList[0].id);
    } else {
      await createNewChat(userId); // Automatically create a new chat if none exists
    }
  };

  const createNewChat = async (userId) => {
    const newChat = {
      id: `local-${Date.now()}`, // Temporary ID for new chat
      title: "New Chat",
      messages: [],
    };
    setChats((prevChats) => [...prevChats, newChat]);
    setSelectedChat(newChat.id);
  };

  const handleCreateNewChat = async () => {
    const newChatExists = chats.some((chat) => chat.title === "New Chat");

    if (!newChatExists) {
      await createNewChat(user.uid);
    } else {
      alert(
        "You already have a 'New Chat' open. Please use it or rename it to create another."
      );
    }
  };

  const deleteChat = async (chatId) => {
    if (!chatId.startsWith("local-")) {
      const chatRef = doc(db, "users", user.uid, "chats", chatId);
      await deleteDoc(chatRef);
    }

    // Remove the chat from the state
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

    // Check if there are any chats left
    if (chats.length <= 1) {
      // No chats left after deletion, create a new chat
      await createNewChat(user.uid);
    } else {
      // Select the first available chat
      setSelectedChat(chats[0]?.id || null);
    }
  };

  const saveChatToDb = async (userId, chatId, messages, title) => {
    if (chatId.startsWith("local-")) {
      const chatData = { messages, title };
      const chatDoc = await addDoc(
        collection(db, "users", userId, "chats"),
        chatData
      );
      const newChatId = chatDoc.id;

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, id: newChatId, title } : chat
        )
      );
      setSelectedChat(newChatId);
    } else {
      const chatRef = doc(db, "users", userId, "chats", chatId);
      await updateDoc(chatRef, { messages, title });
    }
  };

  return (
    <div className="main_app">
      {!user ? (
        <div>
          <Login />
          <SignUpComponent />
        </div>
      ) : (
        <div>
          <Header />
          <ChatComponent
            userId={user.uid}
            chats={chats}
            selectedChatId={selectedChat}
            onNewChatSelect={setSelectedChat}
            onCreateNewChat={handleCreateNewChat}
            onDeleteChat={deleteChat}
            className="ChatComponent"
            onSaveChat={saveChatToDb}
          />
        </div>
      )}
    </div>
  );
};

export default App;
