import React from 'react';
import { FaThumbtack } from 'react-icons/fa';
import { 
  // renderAvatar, 
  renderGroupAvatar } from '../../utils/avatarUtils.jsx';

const Modals = ({
  // Forward Modal
  forwardModal,
  setForwardModal,
  forwardTarget,
  setForwardTarget,
  handleForwardSelect,
  users,
  groups,
  username,
  
  // Edit Modal
  editModal,
  editMessageText,
  setEditMessageText,
  saveEditedMessage,
  cancelEdit,
  
  // Bio Edit Modal
  bioEditModal,
  setBioEditModal,
  handleBioSave,
  cancelBioEdit,
  
  // Group Edit Modal
  groupEditModal,
  setGroupEditModal,
  groups: allGroups,
  handleGroupAvatarFileSelect,
  handleGroupAvatarEditorSave,
  handleGroupAvatarEditorCancel,
  saveGroupChanges,
  cancelGroupEdit,
  removeSelectedAvatar,
  toggleMemberSelector,
  addMember,
  removeMember,
  handleDeleteGroup,
  handleLeaveGroup,
  handleAddAdmin,
  handleRemoveAdmin,
  toggleAdminSelector,
  isUserAdminOrCreator,
  isUserCreator,
  
  // Pinned Messages Modal
  showPinnedModal,
  setShowPinnedModal,
  selectedGroup,
  groupChats,
  handlePinMessage,
  
  // Media Viewer Modal
  mediaViewer,
  closeMediaViewer,
  
  // Schedule Modal
  showScheduleModal,
  setShowScheduleModal,
  scheduledDateTime,
  setScheduledDateTime,
  setIsScheduled,
  
  // // Create Poll Modal
  // showCreatePollModal,
  // setShowCreatePollModal,
  // handleCreatePoll,
  
  // Edit Success
  editSuccess,
  
  // Send Message
  sendMessage
}) => {
  return (
    <>
      {/* Forward modal */}
      {forwardModal.open && (
        <div className="wa-modal-backdrop">
          <div className="wa-modal">
            <div className="wa-modal-header">
              <span>Forward Message</span>
              <button
                className="wa-modal-close"
                onClick={() => {
                  setForwardModal({ open: false, msg: null });
                  // Reset forward target when closing modal
                  if (typeof setForwardTarget === 'function') {
                    setForwardTarget({ user: null, group: null, public: false });
                  }
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ marginBottom: 10 }}>Select chat to forward to:</div>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              <div
                className={`wa-user${forwardTarget.public ? " active" : ""}`}
                onClick={() => handleForwardSelect("public")}
              >
                Public Chat
              </div>
              {users.map((u) => (
                <div
                  key={u.username}
                  className={`wa-user${forwardTarget.user === u.username ? " active" : ""}`}
                  onClick={() => handleForwardSelect("user", u.username)}
                >
                  {u.username}
                </div>
              ))}
              {groups
                .filter((g) => g.members.includes(username))
                .map((group) => (
                  <div
                    key={group.name}
                    className={`wa-user wa-group${forwardTarget.group === group.name ? " active" : ""}`}
                    onClick={() => handleForwardSelect("group", group.name)}
                  >
                    #{group.name}
                  </div>
                ))}
            </div>
           <div className="modal-actions-container">
             <button
               className="wa-modal-btn wa-modal-cancel"
               onClick={() => {
                 setForwardModal({ open: false, msg: null });
                 setForwardTarget({ user: null, group: null, public: false });
               }}
             >
               Cancel
             </button>
             <button
               className="wa-modal-btn wa-modal-create"
               disabled={
                 !forwardTarget.public && !forwardTarget.user && !forwardTarget.group
               }
               onClick={sendMessage}
             >
               Send
             </button>
           </div>
          </div>
        </div>
      )}
      
      {/* Edit Message Modal */}
      {editModal.open && (
        <div className="wa-modal-backdrop">
          <div className="wa-edit-modal">
            <div className="wa-modal-header">
              <span>Edit Message</span>
              <button
                className="wa-modal-close"
                onClick={cancelEdit}
              >
                &times;
              </button>
            </div>
            <div className="wa-edit-content">
              <textarea
                value={editMessageText}
                onChange={(e) => setEditMessageText(e.target.value)}
                className="wa-edit-textarea"
                placeholder="Edit your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    saveEditedMessage();
                  } else if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="wa-modal-actions">
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                className="wa-modal-btn wa-modal-create"
                onClick={saveEditedMessage}
                disabled={!editMessageText.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bio Edit Modal */}
      {bioEditModal.open && (
        <div className="wa-modal-backdrop">
          <div className="wa-edit-modal">
            <div className="wa-modal-header">
              <span>Edit Bio</span>
              <button
                className="wa-modal-close"
                onClick={cancelBioEdit}
              >
                &times;
              </button>
            </div>
            <div className="wa-edit-content">
              <textarea
                value={bioEditModal.text}
                onChange={(e) => setBioEditModal({ ...bioEditModal, text: e.target.value })}
                className="wa-edit-textarea"
                placeholder="Enter your bio..."
                maxLength={120}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleBioSave();
                  } else if (e.key === "Escape") {
                    cancelBioEdit();
                  }
                }}
                autoFocus
              />
              <div style={{ fontSize: "12px", color: "#888", textAlign: "right", marginTop: "4px" }}>
                {bioEditModal.text.length}/120 characters
              </div>
            </div>
            <div className="wa-modal-actions">
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={cancelBioEdit}
              >
                Cancel
              </button>
              <button
                className="wa-modal-btn wa-modal-create"
                onClick={handleBioSave}
                disabled={!bioEditModal.text.trim()}
              >
                Save Bio
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Group Edit Modal */}
      {groupEditModal.open && (
        <div className="wa-modal-backdrop">
          <div className="wa-group-edit-modal">
            <div className="wa-modal-header">
              <span>Edit Group Settings</span>
              <button
                className="wa-modal-close"
                onClick={cancelGroupEdit}
              >
                &times;
              </button>
            </div>
            
            <div className="wa-group-edit-content">
              {/* Group Info Section */}
              <div className="wa-group-info-section">
                <div className="wa-group-header">
                  <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "16px" }}>
                    #{groupEditModal.groupName}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                      {groupEditModal.members.length} members
                    </p>
                    <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
                      Created: {allGroups.find(g => g.name === groupEditModal.groupName)?.createdAt ? 
                        new Date(allGroups.find(g => g.name === groupEditModal.groupName).createdAt).toLocaleDateString() : 
                        'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Group Name Section */}
              <div className="wa-group-name-section">
                <h4 style={{ margin: "0 0 12px 0", color: "#333", fontSize: "14px" }}>Group Name</h4>
                <input
                  type="text"
                  value={groupEditModal.newGroupName}
                  onChange={(e) => setGroupEditModal(prev => ({ ...prev, newGroupName: e.target.value }))}
                  placeholder="Enter group name..."
                  maxLength={50}
                  className="wa-group-name-input"
                />
                <div style={{ fontSize: "12px", color: "#888", textAlign: "right", marginTop: "4px" }}>
                  {groupEditModal.newGroupName.length}/50 characters
                </div>
              </div>

              {/* Avatar Section */}
              <div className="wa-group-avatar-section">
                <h4 style={{ margin: "0 0 12px 0", color: "#333", fontSize: "14px" }}>Group Avatar</h4>
                <div className="wa-avatar-preview-container">
                  <div className="wa-avatar-preview">
                    {groupEditModal.previewUrl ? (
                      <img 
                        src={groupEditModal.previewUrl} 
                        alt="Preview" 
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      renderGroupAvatar(
                        allGroups.find(g => g.name === groupEditModal.groupName)?.avatarUrl,
                        groupEditModal.groupName,
                        80,
                        { border: "3px solid #4a90e2" }
                      )
                    )}
                  </div>
                  <div className="wa-avatar-actions">
                    <label htmlFor="group-avatar-upload" className="wa-avatar-upload-btn">
                      <input
                        id="group-avatar-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleGroupAvatarFileSelect}
                      />
                      {groupEditModal.previewUrl ? "Change Image" : "Upload Image"}
                    </label>
                    {groupEditModal.previewUrl && (
                      <button
                        onClick={removeSelectedAvatar}
                        className="wa-avatar-remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="wa-group-description-section">
                <h4 style={{ margin: "0 0 12px 0", color: "#333", fontSize: "14px" }}>Group Description</h4>
                <textarea
                  value={groupEditModal.description}
                  onChange={(e) => setGroupEditModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter group description..."
                  maxLength={200}
                  rows={3}
                  className="wa-group-description-input"
                />
                <div style={{ fontSize: "12px", color: "#888", textAlign: "right", marginTop: "4px" }}>
                  {groupEditModal.description.length}/200 characters
                </div>
              </div>

              {/* Members Section */}
              <div className="wa-group-members-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: "0", color: "#333", fontSize: "14px" }}>Group Members</h4>
                  <button
                    onClick={toggleMemberSelector}
                    className="wa-add-member-btn"
                  >
                    {groupEditModal.showMemberSelector ? "Cancel" : "Add Members"}
                  </button>
                </div>
                
                {/* Current Members */}
                <div className="wa-current-members">
                  {groupEditModal.members.map((member, index) => (
                    <div key={index} className="wa-member-item">
                      <span className="wa-member-name">{member}</span>
                      <button
                        onClick={() => removeMember(member)}
                        className="wa-remove-member-btn"
                        title="Remove member"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {groupEditModal.members.length === 0 && (
                    <div style={{ color: "#999", fontStyle: "italic", fontSize: "13px" }}>
                      No members added
                    </div>
                  )}
                </div>

                {/* Member Selector */}
                {groupEditModal.showMemberSelector && (
                  <div className="wa-member-selector">
                    <h5 style={{ margin: "0 0 8px 0", color: "#666", fontSize: "13px" }}>Available Users</h5>
                    <div className="wa-available-users">
                      {users
                        .filter(user => !groupEditModal.members.includes(user.username))
                        .map((user) => (
                          <div
                            key={user.username}
                            className="wa-user-option"
                            onClick={() => addMember(user.username)}
                          >
                            <span>{user.username}</span>
                            <span style={{ color: "#4a90e2", fontSize: "12px" }}>+ Add</span>
                          </div>
                        ))}
                      {users.filter(user => !groupEditModal.members.includes(user.username)).length === 0 && (
                        <div style={{ color: "#999", fontStyle: "italic", fontSize: "13px" }}>
                          All users are already members
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Management Section - Only show if user is admin or creator */}
              {isUserAdminOrCreator && isUserAdminOrCreator(groupEditModal.groupName) && (
                <div className="wa-group-members-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: "0", color: "#333", fontSize: "14px" }}>Admin Management</h4>
                    <button
                      onClick={toggleAdminSelector}
                      className="wa-add-member-btn"
                    >
                      {groupEditModal.showAdminSelector ? "Cancel" : "Manage Admins"}
                    </button>
                  </div>
                  
                  {/* Current Admins */}
                  <div className="wa-current-members">
                    {allGroups.find(g => g.name === groupEditModal.groupName)?.admins?.map((admin, index) => (
                      <div key={index} className="wa-member-item">
                        <span className="wa-member-name">
                          {admin}
                          {allGroups.find(g => g.name === groupEditModal.groupName)?.creator === admin && (
                            <span style={{ color: "#4a90e2", fontSize: "12px", marginLeft: "8px" }}>
                              (Creator)
                            </span>
                          )}
                        </span>
                        {/* Only creator can remove admins, and can't remove themselves */}
                        {isUserCreator && isUserCreator(groupEditModal.groupName) && 
                         allGroups.find(g => g.name === groupEditModal.groupName)?.creator !== admin && (
                          <button
                            onClick={() => handleRemoveAdmin(admin)}
                            className="wa-remove-member-btn"
                            title="Remove admin"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )) || []}
                    {(!allGroups.find(g => g.name === groupEditModal.groupName)?.admins || 
                      allGroups.find(g => g.name === groupEditModal.groupName)?.admins?.length === 0) && (
                      <div style={{ color: "#999", fontStyle: "italic", fontSize: "13px" }}>
                        No admins set
                      </div>
                    )}
                  </div>

                  {/* Admin Selector */}
                  {groupEditModal.showAdminSelector && (
                    <div className="wa-member-selector">
                      <h5 style={{ margin: "0 0 8px 0", color: "#666", fontSize: "13px" }}>Add Admin</h5>
                      <div className="wa-available-users">
                        {groupEditModal.members
                          .filter(member => 
                            !allGroups.find(g => g.name === groupEditModal.groupName)?.admins?.includes(member)
                          )
                          .map((member) => (
                            <div
                              key={member}
                              className="wa-user-option"
                              onClick={() => handleAddAdmin(member)}
                            >
                              <span>{member}</span>
                              <span style={{ color: "#4a90e2", fontSize: "12px" }}>+ Make Admin</span>
                            </div>
                          ))}
                        {groupEditModal.members.filter(member => 
                          !allGroups.find(g => g.name === groupEditModal.groupName)?.admins?.includes(member)
                        ).length === 0 && (
                          <div style={{ color: "#999", fontStyle: "italic", fontSize: "13px" }}>
                            All members are already admins
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="wa-modal-actions">
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={cancelGroupEdit}
              >
                Cancel
              </button>
              <button
                className="wa-modal-btn wa-modal-create"
                onClick={saveGroupChanges}
              >
                Save Changes
              </button>
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </button>
                            {/* Only show delete button for creator */}
              {isUserCreator && isUserCreator(groupEditModal.groupName) && (
                <button
                  className="wa-modal-btn wa-modal-delete"
                  onClick={handleDeleteGroup}
                >
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Success Notification */}
      {editSuccess && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#4caf50",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 10000,
          fontSize: "14px",
          fontWeight: "500",
          animation: "slideIn 0.3s ease-out"
        }}>
          ✓ Message edited successfully!
        </div>
      )}
      
      {/* Pinned Messages Modal */}
      {showPinnedModal && (
        <div className="wa-modal-backdrop pinned-messages-modal">
          <div className="wa-modal">
            <div className="wa-modal-header">
              <span>📌 Pinned Messages - #{selectedGroup}</span>
              <button
                className="wa-modal-close"
                onClick={() => setShowPinnedModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '20px' }}>
              {(groupChats[selectedGroup]?.filter(m => m.pinned).length > 0) ? (
                groupChats[selectedGroup]
                  .filter(m => m.pinned)
                  .sort((a, b) => (a.pinOrder || 0) - (b.pinOrder || 0))
                  .map((msg, idx) => (
                    <div key={msg._id || idx} className="pinned-message-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div className="pin-order-badge">
                          {msg.pinOrder}
                        </div>
                        <FaThumbtack style={{ color: '#e2b007' }} />
                        <span style={{ fontWeight: 600, color: '#333' }}>{msg.sender}</span>
                        <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ color: '#555', marginBottom: 8, lineHeight: '1.4' }}>{msg.message}</div>
                      <div style={{ fontSize: 11, color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span>Pinned by {msg.pinnedBy}</span>
                          <span style={{ marginLeft: '12px' }}>{new Date(msg.pinnedAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => handlePinMessage(msg)}
                          title="Unpin message"
                        >
                          <FaThumbtack size={10} />
                          Unpin
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="pinned-empty-state">
                  <span className="empty-icon">📌</span>
                  <div>No pinned messages in this group</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Pin important messages to keep them easily accessible
                  </div>
                </div>
              )}
            </div>
            <div className="wa-modal-actions">
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={() => setShowPinnedModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Media Viewer Modal */}
      {mediaViewer.open && (
        <div className="media-viewer-backdrop" onClick={closeMediaViewer}>
          <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="media-viewer-header">
              <div className="media-viewer-info">
                <span className="media-sender">{mediaViewer.sender}</span>
                <span className="media-timestamp">
                  {new Date(mediaViewer.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <button className="media-viewer-close" onClick={closeMediaViewer}>
                ×
              </button>
            </div>
            <div className="media-viewer-body">
              {mediaViewer.mediaType?.startsWith("image") ? (
                <img
                  src={mediaViewer.mediaUrl}
                  alt="Full size image"
                  className="media-viewer-image"
                />
              ) : mediaViewer.mediaType?.startsWith("video") ? (
                <video
                  src={mediaViewer.mediaUrl}
                  controls
                  autoPlay
                  className="media-viewer-video"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Message Modal */}
      {showScheduleModal && (
        <div className="wa-modal-backdrop">
          <div className="wa-modal">
            <div className="wa-modal-header">
              <span>Schedule Message</span>
              <button
                className="wa-modal-close"
                onClick={() => setShowScheduleModal(false)}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Select Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                Message will be sent at the selected time. You can cancel by clicking the schedule button again.
              </div>
            </div>
            <div className="wa-modal-actions">
              <button
                className="wa-modal-btn wa-modal-cancel"
                onClick={() => {
                  setShowScheduleModal(false);
                  setIsScheduled(false);
                  setScheduledDateTime("");
                }}
              >
                Cancel
              </button>
              <button
                className="wa-modal-btn wa-modal-create"
                onClick={() => {
                  if (scheduledDateTime) {
                    setIsScheduled(true);
                    setShowScheduleModal(false);
                  }
                }}
                disabled={!scheduledDateTime}
              >
                Schedule Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modals; 