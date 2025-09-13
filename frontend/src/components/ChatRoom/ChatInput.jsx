import React from 'react';
import { FaSmile, FaPaperclip, FaPaperPlane, FaPoll, FaClock } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const ChatInput = ({
  message,
  sendMessage,
  selectedGroup,
  media,
  handleMediaChange,
  showEmoji,
  setShowEmoji,
  handleEmojiSelect,
  setShowCreatePollModal,
  replyTo,
  setReplyTo,
  mentionSuggestions,
  showMentionSuggestions,
  selectedMentionIndex,
  setSelectedMentionIndex,
  insertMention,
  handleInputChange,
  isTemporaryMessage,
  isViewOnce,
  setIsViewOnce,
  showTemporaryMessageOptions,
  toggleTemporaryMessage,
  selectTemporaryDuration,
  temporaryMessageDuration,
  setShowScheduleModal,
  isScheduled,
  scheduledDateTime,
  setShowMentionSuggestions,
  setMentionSuggestions
}) => {
  return (
    <>
      {/* Reply preview above input */}
      {replyTo && (
        <div className="reply-preview-input">
          <b>Replying to:</b> {replyTo.sender}
          <span className="reply-close-btn" onClick={() => setReplyTo(null)}>&times;</span>
          <div className="reply-preview-content">
            {replyTo.message}
          </div>
        </div>
      )}
      
      <div className="chat-input-container">
        <label htmlFor="media-upload" className="wa-attach-btn">
          <FaPaperclip size={18} />
          <input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleMediaChange}
          />
        </label>
        
        {selectedGroup && (
          <button
            type="button"
            className="poll-btn"
            onClick={() => setShowCreatePollModal(true)}
            title="Create Poll"
          >
            <FaPoll size={18} />
          </button>
        )}
        
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={message}
            placeholder="Type message"
            onChange={handleInputChange}
            className="chat-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showMentionSuggestions) {
                sendMessage();
              } else if (e.key === "Enter" && showMentionSuggestions) {
                e.preventDefault();
                if (mentionSuggestions[selectedMentionIndex]) {
                  insertMention(mentionSuggestions[selectedMentionIndex]);
                }
              } else if (e.key === "ArrowDown" && showMentionSuggestions) {
                e.preventDefault();
                setSelectedMentionIndex((prev) => 
                  prev < mentionSuggestions.length - 1 ? prev + 1 : 0
                );
              } else if (e.key === "ArrowUp" && showMentionSuggestions) {
                e.preventDefault();
                setSelectedMentionIndex((prev) => 
                  prev > 0 ? prev - 1 : mentionSuggestions.length - 1
                );
              } else if (e.key === "Escape" && showMentionSuggestions) {
                e.preventDefault();
                setShowMentionSuggestions(false);
                setMentionSuggestions([]);
              }
            }}
          />
          
          {/* Mention suggestions dropdown */}
          {showMentionSuggestions && mentionSuggestions.length > 0 && (
            <div className="mention-suggestions">
              {mentionSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.username}
                  className={`mention-suggestion-item ${index === selectedMentionIndex ? 'selected' : ''}`}
                  onClick={() => insertMention(suggestion)}
                >
                  <div className="mention-suggestion-avatar">
                    {suggestion.type === 'all' ? 'A' : suggestion.username[0].toUpperCase()}
                  </div>
                  <span className={`mention-suggestion-username ${suggestion.type === 'all' ? 'mention-suggestion-all' : ''}`}>
                    {suggestion.display}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          className="wa-emoji-btn"
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          tabIndex={-1}
        >
          <FaSmile size={18} />
        </button>
      </div>
      
      {showEmoji && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 30,
            zIndex: 10,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}
      
      {/* Temporary message button positioned outside input box */}
      <div style={{ position: 'relative', marginRight: '8px' }}>
        <button
          type="button"
          className={`temporary-btn ${isTemporaryMessage ? 'active' : ''}`}
          onClick={toggleTemporaryMessage}
          title={isTemporaryMessage ? `Temporary: ${temporaryMessageDuration === 30 ? '30s' : temporaryMessageDuration === 60 ? '1m' : temporaryMessageDuration === 300 ? '5m' : temporaryMessageDuration === 3600 ? '1h' : temporaryMessageDuration === 86400 ? '1d' : `${temporaryMessageDuration}s`}` : "Temporary Message"}
        >
          <FaClock size={16} />
        </button>
        
        {showTemporaryMessageOptions && (
          <div className="temporary-options">
            <div onClick={() => selectTemporaryDuration(30)}>30 seconds</div>
            <div onClick={() => selectTemporaryDuration(60)}>1 minute</div>
            <div onClick={() => selectTemporaryDuration(300)}>5 minutes</div>
            <div onClick={() => selectTemporaryDuration(3600)}>1 hour</div>
            <div onClick={() => selectTemporaryDuration(86400)}>1 day</div>
          </div>
        )}
      </div>
      
      {/* View Once button - only show when image media is selected */}
      {media && media.type.startsWith("image") && (
        <div style={{ position: 'relative', marginRight: '8px' }}>
          <button
            type="button"
            className={`view-once-btn ${isViewOnce ? 'active' : ''}`}
            onClick={() => setIsViewOnce(!isViewOnce)}
            title={isViewOnce ? "View Once: Enabled" : "View Once: Disabled"}
          >
            👁️
          </button>
        </div>
      )}
      
      {/* Schedule button */}
      <div style={{ position: 'relative', marginRight: '8px' }}>
        <button
          type="button"
          className={`schedule-btn ${isScheduled ? 'active' : ''}`}
          onClick={() => setShowScheduleModal(true)}
          title={isScheduled ? `Scheduled for ${new Date(scheduledDateTime).toLocaleString()}` : "Schedule Message"}
        >
          ⏰
        </button>
      </div>
      
      <button onClick={sendMessage} className="send-button">
        <FaPaperPlane size={18} />
      </button>
    </>
  );
};

export default ChatInput; 