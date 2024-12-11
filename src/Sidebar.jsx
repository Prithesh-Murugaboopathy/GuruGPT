import React, { useState } from "react";
import "./Sidebar.css";
import { BlurOnRounded, SearchRounded } from "@mui/icons-material";

const Sidebar = ({
  chats,
  onSearch,
  onCreateNewChat,
  onDeleteChat,
  selectedChatId,
  onNewChatSelect,
  userName,
  signOutUser,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState(""); // Local search state

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query); // Update parent state
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (text.length > 32) {
      return `${text.substring(0, 32)}...`;
    }
    return text;
  };

  return (
    <div className="sidebar">
      <div className="top-part">
        <div className="brandLogo">
          <div className="brand">
            <BlurOnRounded className="Logo" />
            &nbsp; GuruGPT
          </div>
        </div>
        <div className="user-profile">
          <img
            src={user?.photoURL || "./default-avatar.png"}
            alt="Profile"
            className="profile-pic"
          />
          <div>{user?.displayName || "Guest User"}</div>
        </div>
        <div className="search-for-chats">
          <SearchRounded />
          <input
            type="text"
            placeholder="Search for chats..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="title">CHAT HISTORY</div>
      </div>
      <div className="chat-list">
        {chats.length === 0 ? (
          <div>No chats available. Create a new one.</div>
        ) : (
          <div>
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${
                  chat.id === selectedChatId ? "selected" : ""
                }`}
                onClick={() => onNewChatSelect(chat.id)}
                title={chat.title} // Tooltip to show full text
              >
                <span>{truncateText(chat.title, 20)}</span>
                {/* Truncate chat title to 20 characters */}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={signOutUser} className="Signout-btn">
        Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
