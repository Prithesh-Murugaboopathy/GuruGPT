import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "./firebaseConfig";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Sidebar from "./Sidebar";
import ChatComponent from "./FrotendInt/ChatComponent/ChatComponent";
import "./App.css";
import { BlurOnRounded } from "@mui/icons-material";

const App = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrCreateChat = useCallback(async (userId) => {
    const chatsRef = collection(db, "users", userId, "chats");
    const snapshot = await getDocs(chatsRef);
    const chatsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (chatsList.length > 0) {
      setChats(chatsList);
      const savedChatId = localStorage.getItem("selectedChatId");
      if (savedChatId) {
        setSelectedChat(savedChatId);
      } else {
        setSelectedChat(chatsList[0].id);
      }
    } else {
      await createNewChat(userId);
    }
  }, []); // Empty array means this callback function doesn't change unless a prop/state it depends on does.

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await loadOrCreateChat(currentUser.uid);
      } else {
        setChats([]);
      }
    });

    return () => unsubscribe();
  }, [loadOrCreateChat]); // Add loadOrCreateChat to the dependency array

  const createNewChat = async (userId) => {
    const newChat = {
      id: `local-${Date.now()}`,
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

    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

    if (chats.length <= 1) {
      await createNewChat(user.uid);
    } else {
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

  const handleChatSelect = async (chatId) => {
    if (chatId !== selectedChat) {
      setSelectedChat(chatId);
      if (selectedChat && selectedChat !== "local-" && chatId !== "local-") {
        const newChat = chats.find((chat) => chat.title === "New Chat");
        if (newChat) {
          await deleteChat(newChat.id);
        }
      }
    }
  };

  const filteredChats = chats
    .filter((chat) => chat.title !== "New Chat")
    .filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reverse();

  if (loading) {
    return (
      <div>
        <div className="brand" style={{ textAlign: "center", width: "100vw" }}>
          <BlurOnRounded className="Logo" />
          &nbsp; GuruGPT
        </div>
      </div>
    );
  }

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <div className="main_app">
      {!user ? (
        <div>
          <button onClick={googleSignIn}>Sign In with Google</button>
        </div>
      ) : (
        <div className="sub_app">
          <Sidebar
            chats={filteredChats}
            onChatSelect={handleChatSelect}
            onCreateNewChat={handleCreateNewChat}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(query) => setSearchQuery(query)}
            onDeleteChat={deleteChat}
            selectedChatId={selectedChat}
            onNewChatSelect={handleChatSelect}
            user={user}
            signOutUser={signOutUser}
          />
          <ChatComponent
            selectedChat={selectedChat}
            chats={chats}
            onSaveChat={saveChatToDb}
            onDeleteChat={deleteChat}
            userId={user.uid}
            selectedChatId={selectedChat}
            onNewChatSelect={handleChatSelect}
            onCreateNewChat={handleCreateNewChat}
            user={user}
          />
        </div>
      )}
    </div>
  );
};

export default App;
