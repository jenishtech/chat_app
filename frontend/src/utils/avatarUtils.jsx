import React from 'react';

// Helper to render avatar: image if available, else first letter in a colored circle
export const renderAvatar = (url, name, size = 48, style = {}) => {
  if (url) {
    return (
      <img
        src={url}
        alt="avatar"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", background: "#eee", ...style }}
      />
    );
  }
  // Pick a color based on name
  const colors = ["#4a90e2", "#e67e22", "#16a085", "#e74c3c", "#8e44ad", "#2ecc71", "#f39c12", "#d35400"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: size * 0.48,
      border: "2px solid #fff",
      ...style
    }}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
};

// Helper to render group avatar: image if available, else first character of group name
export const renderGroupAvatar = (url, groupName, size = 48, style = {}) => {
  if (url) {
    return (
      <img
        src={url}
        alt="group avatar"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", background: "#eee", ...style }}
      />
    );
  }
  // Pick a color based on group name
  const colors = ["#4a90e2", "#e67e22", "#16a085", "#e74c3c", "#8e44ad", "#2ecc71", "#f39c12", "#d35400"];
  const color = colors[(groupName?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: size * 0.48,
      border: "2px solid #fff",
      ...style
    }}>
      {groupName ? groupName[0].toUpperCase() : "#"}
    </div>
  );
};

// Helper to render message text with mentions
export const renderMessageWithMentions = (messageText, mentions = []) => {
  if (!messageText) return null;
  
  const parts = [];
  let lastIndex = 0;
  
  // Find all @mentions in the text
  const mentionRegex = /@(\w+)/g;
  let match;
  
  while ((match = mentionRegex.exec(messageText)) !== null) {
    const fullMatch = match[0];
    const username = match[1];
    const startIndex = match.index;
    
    // Add text before the mention
    if (startIndex > lastIndex) {
      parts.push(messageText.slice(lastIndex, startIndex));
    }
    
    // Check if this is a valid mention
    const isAllMention = username.toLowerCase() === 'all';
    const isValidMention = isAllMention || mentions.includes(username);
    
    if (isValidMention) {
      parts.push(
        <span 
          key={`mention-${startIndex}`}
          className={`mention ${isAllMention ? 'all' : ''}`}
          title={isAllMention ? 'Mentioned everyone' : `Mentioned ${username}`}
        >
          {fullMatch}
        </span>
      );
    } else {
      // Not a valid mention, just show as regular text
      parts.push(fullMatch);
    }
    
    lastIndex = startIndex + fullMatch.length;
  }
  
  // Add remaining text
  if (lastIndex < messageText.length) {
    parts.push(messageText.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : messageText;
}; 