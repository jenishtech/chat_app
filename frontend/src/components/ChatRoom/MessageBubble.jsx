import React from 'react';
import { FaReply, FaPencilAlt, FaShare, FaThumbtack, FaTrash } from 'react-icons/fa';
import { renderAvatar, renderMessageWithMentions } from '../../utils/avatarUtils.jsx';
import Poll from '../Poll';

const MessageBubble = ({
  msg,
  username,
  selectedGroup,
  selectedUser,
  // groups,
  polls,
  currentTime,
  getAvatarUrl,
  findMessageById,
  handleReaction,
  handleEditMessage,
  handlePinMessage,
  handleViewOnceClick,
  handleMediaClick,
  handleVotePoll,
  handleClosePoll,
  setReplyTo,
  setForwardModal,
  socket,
  reactionBox,
  setReactionBox,
  editModal,
  REACTION_EMOJIS
}) => {
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = currentTime;
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return "Expired";
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div
      className={`message-wrapper ${
        msg.sender === username ? "own" : "other"
      }`}
    >
      {/* Reply/Forward preview above message if this is a reply/forward - only for non-deleted messages */}
      {!msg.deleted && msg.replyTo && (
        <div className="reply-preview">
          <b>Reply to:</b> {findMessageById(msg.replyTo)?.sender || "Message"}
          <div className="reply-preview-content">
            {findMessageById(msg.replyTo)?.message || "(original message)"}
          </div>
        </div>
      )}
      {!msg.deleted && msg.forwardedFrom && (
        <div className="forward-preview">
          <b>Forwarded from:</b> {msg.forwardedFrom}
        </div>
      )}
      {/* Show edited indicator above message */}
      {!msg.deleted && msg.edited && (
        <div className="edited-indicator">
          edited
        </div>
      )}
      {/* Show pinned indicator */}
      {!msg.deleted && msg.pinned && (
        <div className="pinned-indicator">
          <FaThumbtack size={10} />
          <span>Pinned #{msg.pinOrder}</span>
        </div>
      )}
      {/* Show temporary message indicator */}
      {!msg.deleted && msg.isTemporary && (
        <div className="temporary-indicator">
          ⏰ Temporary message
        </div>
      )}
      {/* Show view-once indicator (only for images) */}
      {!msg.deleted && msg.isViewOnce && msg.mediaType?.startsWith("image") && (
        <div className="view-once-indicator">
          👁️ View once
        </div>
      )}
      {/* Show scheduled message indicator */}
      {!msg.deleted && msg.isScheduled && !msg.scheduled && (
        <div className="scheduled-indicator">
          ⏰ Scheduled for {new Date(msg.scheduledAt).toLocaleString()}
        </div>
      )}
      {/* Show sent scheduled message indicator */}
      {!msg.deleted && msg.isScheduled && msg.scheduled && (
        <div className="scheduled-sent-indicator">
          ✅ Sent at {new Date(msg.scheduledAt).toLocaleString()}
        </div>
      )}
      <div className="message-sender message-sender-header">
        {renderAvatar(getAvatarUrl(msg.sender), msg.sender, 22, { marginRight: 6, border: "1.5px solid #4a90e2" })}
        {msg.sender} {" "}
        <span className="message-time">
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {/* Show action buttons only for non-deleted messages */}
        {!msg.deleted && (
          <>
            {/* Reply button */}
            <button
              className="action-button"
              title="Reply"
              onClick={(e) => {
                e.stopPropagation();
                setReplyTo(msg);
              }}
            >
              <FaReply size={14} />
            </button>
            {/* Edit button - only for own messages */}
            {msg.sender === username && (
              <button
                className="action-button edit-button"
                title="Edit message"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditMessage(msg);
                }}
              >
                <FaPencilAlt size={14} />
              </button>
            )}
            {/* Forward button */}
            <button
              className="action-button forward-button"
              title="Forward"
              onClick={(e) => {
                e.stopPropagation();
                setForwardModal({ open: true, msg });
              }}
            >
              <FaShare size={14} />
            </button>
            {/* Pin button - only show in group chats */}
            {selectedGroup && (
              <button
                className={`pin-button ${msg.pinned ? 'pinned' : ''}`}
                title={msg.pinned ? "Unpin message" : "Pin message"}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinMessage(msg);
                }}
              >
                <FaThumbtack size={14} />
              </button>
            )}
          </>
        )}
      </div>
      <div
        onClick={(e) => {
          if (msg.sender !== username && msg._id) {
            // Open reaction box for receiver
            const rect = e.target.getBoundingClientRect();
            setReactionBox({ open: true, msgId: msg._id, x: rect.left, y: rect.top });
          } else if (msg.sender === username && msg._id && !msg.deleted) {
            if (window.confirm("Delete this message?")) {
              socket.emit("delete_message", msg._id);
            }
          }
        }}
        className={`message-bubble ${msg.pinned && !msg.deleted ? 'pinned-message-bubble' : ''} ${msg.sender === username && !msg.deleted ? 'message-bubble-deletable' : 'message-bubble-default'} ${msg.isSystemMessage ? 'system-message' : ''}`}
        style={{
          position: "relative",
          background: msg.pinned && !msg.deleted ? "#fffbe6" : undefined
        }}
      >
        {msg.deleted ? (
          <div className="deleted-message">
            <span className="deleted-message-text">
              {msg.expired ? "⏰ Message expired" : "🗑️ Message deleted"}
            </span>
          </div>
        ) : (
          <>
            <div className="message-content">
              {msg.pinned && (
                <span className="pin-icon" title="Pinned message">
                  <FaThumbtack />
                </span>
              )}
              <span className={msg.pinned ? "message-text-pinned" : ""}>
                {renderMessageWithMentions(msg.message, msg.mentions)}
              </span>
            </div>
            {/* Media preview for images (with view-once support) */}
            {msg.mediaUrl && msg.mediaType?.startsWith("image") && (
              <div 
                className="media-container"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {msg.isViewOnce ? (
                  // View-once image display
                  (msg.viewedBy && msg.viewedBy.includes(username)) ? (
                    // Image already viewed - show placeholder
                    <div className="view-once-viewed">
                      <div className="view-once-placeholder">
                        <span>👁️</span>
                        <p>Image already opened</p>
                      </div>
                    </div>
                  ) : (
                    // Image not viewed yet - show view-once button
                    <div className="view-once-button-container">
                      <button
                        className="view-once-button"
                        onClick={() => handleViewOnceClick(msg._id, msg.mediaUrl, msg.mediaType, msg.sender, msg.timestamp)}
                      >
                        <span>👁️</span>
                        <span>View Once Only</span>
                      </button>
                    </div>
                  )
                ) : (
                  // Regular image display
                  <>
                    <img
                      src={msg.mediaUrl}
                      alt="Image/File not found"
                      className="wa-media-img"
                      onClick={() => handleMediaClick(msg.mediaUrl, msg.mediaType, msg.sender, msg.timestamp)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div 
                      className="media-resize-icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleMediaClick(msg.mediaUrl, msg.mediaType, msg.sender, msg.timestamp);
                      }}
                    >
                      ⤢
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Media preview for videos (no view-once support) */}
            {msg.mediaUrl && msg.mediaType?.startsWith("video") && (
              <div 
                className="media-container"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <video
                  src={msg.mediaUrl}
                  alt="Video not found"
                  controls
                  className="wa-media-video"
                  onClick={() => handleMediaClick(msg.mediaUrl, msg.mediaType, msg.sender, msg.timestamp)}
                  style={{ cursor: 'pointer' }}
                />
                <div 
                  className="media-resize-icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleMediaClick(msg.mediaUrl, msg.mediaType, msg.sender, msg.timestamp);
                  }}
                >
                  ⤢
                </div>
              </div>
            )}
            
            {/* Render poll if message has a poll */}
            {msg.pollId && polls[msg.pollId] && (
              <Poll
                poll={polls[msg.pollId]}
                onVote={handleVotePoll}
                onClose={handleClosePoll}
                currentUser={username}
                isCreator={polls[msg.pollId].createdBy === username}
              />
            )}
            <div>
              {editModal.open && editModal.msg && editModal.msg._id === msg._id && (
                <span className="editing-indicator">
                  (editing...)
                </span>
              )}
              {/* Temporary message countdown */}
              {msg.isTemporary && msg.expiresAt && (
                <div className={`temporary-countdown ${
                  getTimeRemaining(msg.expiresAt) === "Expired" ? "expired" : 
                  (() => {
                    const now = currentTime;
                    const expiry = new Date(msg.expiresAt);
                    const diff = expiry - now;
                    return diff <= 10000 ? "warning" : ""; // Warning when less than 10 seconds
                  })()
                }`}>
                  {getTimeRemaining(msg.expiresAt)}
                </div>
              )}
            </div>
          </>
        )}
        <span style={{textAlign: "right"}}>
          {/* Receipts for own messages */}
          {msg.sender === username && selectedUser && !msg.deleted && (
            <span className={`message-receipt ${(msg.seenBy || []).includes(selectedUser) ? 'seen' : 'sent'}`}>
              <span className="message-receipt-icon">
                {(msg.seenBy || []).includes(selectedUser) ? "✓✓" : "✓"}
              </span>
              <span>
                {(msg.seenBy || []).includes(selectedUser) ? "Seen" : "Sent"}
              </span>
            </span>
          )}
        </span>
        {/* Reactions display */}
        {!msg.deleted && msg.reactions && msg.reactions.length > 0 && (
          <div className="wa-reactions-row">
            {msg.reactions.map((r, i) => (
              <span
                key={i}
                className="wa-reaction-bubble"
                title={r.username}
              >
                {r.emoji}
              </span>
            ))}
          </div>
        )}
        {/* Reaction box */}
        {!msg.deleted && reactionBox.open && reactionBox.msgId === msg._id && (
          <div
            style={{
              position: "absolute",
              top: -40,
              left: 0,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 20,
              display: "flex",
              gap: 8,
              padding: "4px 8px"
            }}
            onClick={e => e.stopPropagation()}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <span
                key={emoji}
                style={{ fontSize: 22, cursor: "pointer" }}
                onClick={() => handleReaction(msg._id, emoji)}
              >
                {emoji}
              </span>
            ))}
            <span
              style={{ fontSize: 18, marginLeft: 6, cursor: "pointer", color: "#888" }}
              onClick={() => setReactionBox({ open: false, msgId: null, x: 0, y: 0 })}
            >
              ×
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble; 