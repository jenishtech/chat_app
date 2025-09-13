import React from 'react';
import { FaPencilAlt, FaThumbtack, FaTimes } from 'react-icons/fa';
import { renderAvatar, renderGroupAvatar } from '../../utils/avatarUtils.jsx';

const Sidebar = ({
  username,
  avatarUrl,
  bio,
  search,
  setSearch,
  showPrivateChats,
  setShowPrivateChats,
  showGroups,
  setShowGroups,
  selectedUser,
  selectedGroup,
  users,
  groups,
  pinnedPrivateChats,
  pinnedGroupChats,
  filteredUsers,
  filteredGroups,
  isChatPinned,
  handleChatSelection,
  handlePinChat,
  openGroupEditModal,
  setShowGroupForm,
  showGroupForm,
  newGroupName,
  setNewGroupName,
  newGroupMembers,
  setNewGroupMembers,
  handleCreateGroup,
  // sidebarOpen,
  closeSidebar,
  handleAvatarChange,
  openBioEditModal,
  getAvatarUrl
}) => {
  return (
    <>
      {/* Mobile Sidebar Header with Close Button */}
      <div className="mobile-sidebar-header">
        <span className="mobile-sidebar-title">Chats</span>
        <button 
          className="mobile-sidebar-close"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <FaTimes size={20} />
        </button>
      </div>
      
      <div className="wa-profile">
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="avatar-upload"
          onChange={handleAvatarChange}
        />
        <div
          className="wa-profile-avatar"
          onClick={() => document.getElementById("avatar-upload").click()}
          title="Change avatar"
        >
          {renderAvatar(avatarUrl, username, 48)}
        </div>
        <div className="wa-profile-info">
          <span className="wa-username">{username}</span>
          <div className="wa-bio-container">
            <span className="wa-bio-text">{bio || "No bio set"}</span>
            <button 
              className="wa-bio-edit-btn"
              onClick={openBioEditModal} 
              title="Edit bio"
            >
              <FaPencilAlt size={12} />
            </button>
          </div>
        </div>
      </div>
      <div className="wa-search-bar">
        <input
          type="text"
          placeholder="Search chats..."
          className="wa-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="wa-users">
        <div
          className={`wa-user ${
            !selectedUser && !selectedGroup ? "active" : ""
          }`}
          onClick={() => handleChatSelection('public')}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 6, fontSize: "16px" }}>🗨️</span>
            <span>Public Chat</span>
          </span>
        </div>
        
        {/* Private Chats Dropdown */}
        <div className="wa-section-dropdown">
          <div 
            className="wa-section-title"
            onClick={() => setShowPrivateChats(!showPrivateChats)}
          >
            <span className="wa-dropdown-arrow" style={{ 
              transform: showPrivateChats ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </span>
            <span>Private Chats</span>
          </div>
          {showPrivateChats && (
            <div className="wa-dropdown-content">
              {/* Show pinned private chat at the top */}
              {pinnedPrivateChats.map((pinnedChat) => (
                <div
                  key={pinnedChat.name}
                  className={`wa-user pinned ${selectedUser === pinnedChat.name ? "active" : ""}`}
                  onClick={() => handleChatSelection('user', pinnedChat.name)}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {renderAvatar(getAvatarUrl(pinnedChat.name), pinnedChat.name, 24, { marginRight: 6, border: "1.5px solid #e2b007" })}
                      {pinnedChat.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinChat('user', pinnedChat.name);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e2b007",
                        cursor: "pointer",
                        padding: "2px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        transition: "background-color 0.2s"
                      }}
                      title="Unpin chat"
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(226, 176, 7, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      <FaThumbtack size={10} />
                    </button>
                  </span>
                </div>
              ))}
              
              {/* Show regular users (excluding pinned ones) */}
              {filteredUsers.filter(userObj => !isChatPinned('user', userObj.username)).map((userObj) => (
                <div
                  key={userObj.username}
                  className={`wa-user ${selectedUser === userObj.username ? "active" : ""}`}
                  onClick={() => handleChatSelection('user', userObj.username)}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {renderAvatar(userObj.avatarUrl, userObj.username, 24, { marginRight: 6, border: "1.5px solid #4a90e2" })}
                      {userObj.username}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePinChat('user', userObj.username);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        padding: "2px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        transition: "background-color 0.2s"
                      }}
                      title="Pin chat"
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(74, 144, 226, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      <FaThumbtack size={10} />
                    </button>
                  </span>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="wa-empty-dropdown">No users available</div>
              )}
            </div>
          )}
        </div>

        {/* Groups Dropdown */}
        <div className="wa-section-dropdown">
          <div 
            className="wa-section-title"
            onClick={() => setShowGroups(!showGroups)}
          >
            <span className="wa-dropdown-arrow" style={{ 
              transform: showGroups ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▼
            </span>
            <span>Groups</span>
            <button
              className="plus-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGroupForm(true);
              }}
              title="Create Group"
            >
              +
            </button>
          </div>
          {showGroups && (
            <div className="wa-dropdown-content">
              {/* Show pinned group chat at the top */}
              {pinnedGroupChats.map((pinnedChat) => (
                <div
                  key={pinnedChat.name}
                  className={`wa-user wa-group pinned ${
                    selectedGroup === pinnedChat.name ? "active" : ""
                  }`}
                  onClick={() => handleChatSelection('group', pinnedChat.name)}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                                              {renderGroupAvatar(
                          groups.find(g => g.name === pinnedChat.name)?.avatarUrl, 
                          pinnedChat.name, 
                          24, 
                          { marginRight: 6, border: "1.5px solid #e2b007" }
                        )}
                        <span style={{ flex: 1 }}>
                          #{pinnedChat.name}
                          {groups.find(g => g.name === pinnedChat.name)?.creator === username && (
                            <span style={{ color: "#4a90e2", fontSize: "10px", marginLeft: "4px" }}>
                              (Creator)
                            </span>
                          )}
                          {groups.find(g => g.name === pinnedChat.name)?.admins?.includes(username) && 
                           groups.find(g => g.name === pinnedChat.name)?.creator !== username && (
                            <span style={{ color: "#25d366", fontSize: "10px", marginLeft: "4px" }}>
                              (Admin)
                            </span>
                          )}
                        </span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinChat('group', pinnedChat.name);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e2b007",
                          cursor: "pointer",
                          padding: "2px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          transition: "background-color 0.2s"
                        }}
                        title="Unpin chat"
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "rgba(226, 176, 7, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <FaThumbtack size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openGroupEditModal(pinnedChat.name);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#4a90e2",
                          cursor: "pointer",
                          padding: "2px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          opacity: 0.7,
                          transition: "opacity 0.2s"
                        }}
                        title="Edit group"
                        onMouseEnter={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = "0.7";
                        }}
                      >
                        <FaPencilAlt size={10} />
                      </button>
                    </span>
                  </span>
                </div>
              ))}
              
              {/* Show regular groups (excluding pinned ones) */}
              {filteredGroups
                .filter((g) => g.members.includes(username) && !isChatPinned('group', g.name))
                .map((group) => (
                  <div
                    key={group.name}
                    className={`wa-user wa-group ${
                      selectedGroup === group.name ? "active" : ""
                    }`}
                    onClick={() => handleChatSelection('group', group.name)}
                  >
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {renderGroupAvatar(group.avatarUrl, group.name, 24, { marginRight: 6, border: "1.5px solid #4a90e2" })}
                        <span style={{ flex: 1 }}>
                          #{group.name}
                          {group.creator === username && (
                            <span style={{ color: "#4a90e2", fontSize: "10px", marginLeft: "4px" }}>
                              (Creator)
                            </span>
                          )}
                          {group.admins?.includes(username) && group.creator !== username && (
                            <span style={{ color: "#25d366", fontSize: "10px", marginLeft: "4px" }}>
                              (Admin)
                            </span>
                          )}
                        </span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePinChat('group', group.name);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#666",
                            cursor: "pointer",
                            padding: "2px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            transition: "background-color 0.2s"
                          }}
                          title="Pin chat"
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(74, 144, 226, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                          }}
                        >
                          <FaThumbtack size={10} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGroupEditModal(group.name);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#4a90e2",
                            cursor: "pointer",
                            padding: "2px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            opacity: 0.7,
                            transition: "opacity 0.2s"
                          }}
                          title="Edit group"
                          onMouseEnter={(e) => {
                            e.target.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = "0.7";
                          }}
                        >
                          <FaPencilAlt size={10} />
                        </button>
                      </span>
                    </span>
                  </div>
                ))}
              {filteredGroups.filter((g) => g.members.includes(username)).length === 0 && (
                <div className="wa-empty-dropdown">No groups available</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Group Create Modal */}
      {showGroupForm && (
        <div className="wa-modal-backdrop">
          <div className="wa-modal">
            <div className="wa-modal-header">
              <span>Create Group</span>
              <button
                className="wa-modal-close"
                onClick={() => setShowGroupForm(false)}
              >
                &times;
              </button>
            </div>
            
            {/* Group Info Section */}
            <div className="wa-group-create-info">
              <div className="wa-group-create-stats">
                <div className="wa-stat-item">
                  <span className="wa-stat-label">Selected Members:</span>
                  <span className="wa-stat-value">{newGroupMembers.length + 1}</span>
                </div>
                <div className="wa-stat-item">
                  <span className="wa-stat-label">Creation Date:</span>
                  <span className="wa-stat-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <input
              type="text"
              className="wa-modal-input"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            
            <div className="wa-group-members-section">
              <h4 style={{ margin: "0 0 12px 0", color: "#333", fontSize: "14px" }}>
                Select Members ({newGroupMembers.length} selected)
              </h4>
              <div className="checkbox-list">
                {users.map((u) => (
                  <label key={u.username} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={u.username}
                      checked={newGroupMembers.includes(u.username)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewGroupMembers([...newGroupMembers, u.username]);
                        } else {
                          setNewGroupMembers(
                            newGroupMembers.filter((name) => name !== u.username)
                          );
                        }
                      }}
                    />
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {renderAvatar(u.avatarUrl, u.username, 20, { border: "1px solid #ddd" })}
                      {u.username}
                    </span>
                  </label>
                ))}
              </div>
              {users.length === 0 && (
                <div style={{ color: "#999", fontStyle: "italic", fontSize: "13px", textAlign: "center", padding: "10px" }}>
                  No users available to add
                </div>
              )}
            </div>
            
            <div className="wa-modal-actions">
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={() => setShowGroupForm(false)}
              >
                Cancel
              </button>
              <button
                className="wa-modal-btn wa-modal-create"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || newGroupMembers.length === 0}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 