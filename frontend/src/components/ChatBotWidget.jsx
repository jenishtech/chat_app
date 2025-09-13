import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBotWidget.css";

const DEFAULT_BOT_NAME = "Chatbot";
const CHATBOT_API_URL = import.meta.env.VITE_N8N_CHATBOT_API_URL;
// console.log("Chatbot API URL:", CHATBOT_API_URL);

const ChatBotWidget = () => {
  const [open, setOpen] = useState(false);
  const [windowState, setWindowState] = useState("normal"); // "minimized", "normal", "maximized"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botName, setBotName] = useState(
    localStorage.getItem("chatbot_name") || DEFAULT_BOT_NAME
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [newBotName, setNewBotName] = useState(botName);
  const [isJumping, setIsJumping] = useState(false);
  const messagesEndRef = useRef(null);

  // Save bot name to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chatbot_name", botName);
  }, [botName]);

  const handleSend = async () => {
    // console.log("it called");
    if (!input.trim()) return;
    const userMsg = { sender: "You", content: input, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${CHATBOT_API_URL}/webhook/chatbot`,
        {
          message: userMsg.content,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Chatbot response:", response);

      setMessages((prev) => [
        ...prev,
        {
          sender: botName,
          content: response.data.text || "(No response)",
          isBot: true,
        },
      ]);
    } 
    catch (error) 
    {    
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, {sender: botName,content: "Sorry, chatbot is unavailable.",isBot: true } ]);
    }

    setLoading(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };


// Handlers for window controls(minimize, maximize, restore, close).
  const handleMaximize = () => {
    setWindowState("maximized");
  };

  const handleRestore = () => {
    setWindowState("normal");
  };

  const handleClose = () => {
    setOpen(false);
    setWindowState("normal");
  };

  const handleFabClick = () => {
    if (!open) {
      setOpen(true);
      setWindowState("normal");
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    } else if (windowState === "minimized") {
      setWindowState("normal");
    } else {
      setOpen(false);
    }
  };

  // Handlers for editing bot name
  const handleNameEdit = () => {
    setIsEditingName(true);
    setNewBotName(botName);
  };

  // Save new bot name and update messages
  const handleNameSave = () => {
    if (newBotName.trim()) {
      setBotName(newBotName.trim());
      // Update existing bot messages with new name
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isBot ? { ...msg, sender: newBotName.trim() } : msg
        )
      );
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setNewBotName(botName);
    setIsEditingName(false);
  };

  // Handle Enter/Escape key presses in name input
  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      handleNameCancel();
    }
  };

  // Get window controls based on current state
  const getWindowControls = () => {
    switch (windowState) {
      case "minimized":
        return (
          <>
            <button
              className="chatbot-control-btn"
              onClick={handleRestore}
              title="Restore"
            >
              □
            </button>
            <button
              className="chatbot-control-btn"
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </>
        );
      case "maximized":
        return (
          <>
            <button
              className="chatbot-control-btn"
              onClick={handleRestore}
              title="Restore Down"
            >
              ❐
            </button>
            <button
              className="chatbot-control-btn"
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </>
        );
      default: // normal
        return (
          <>
            <button
              className="chatbot-control-btn"
              onClick={handleMaximize}
              title="Maximize"
            >
              □
            </button>
            <button
              className="chatbot-control-btn"
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </>
        );
    }
  };

  return (
    <>
      <div
        className={`chatbot-fab ${isJumping ? "jumping" : ""}`}
        onClick={handleFabClick}
        title={`Chat with ${botName}`}
      >
        <span role="img" aria-label="Chatbot" className="chatbot-emoji">
          🤖
        </span>
        {open && messages.length > 0 && windowState === "minimized" && (
          <div className="chatbot-notification-badge">{messages.length}</div>
        )}
      </div>
      {open && (
        <div className={`chatbot-popup ${windowState}`}>
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              {isEditingName ? (
                <div className="chatbot-name-edit">
                  <input
                    type="text"
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    onKeyDown={handleNameKeyPress}
                    onBlur={handleNameSave}
                    className="chatbot-name-input"
                    autoFocus
                    maxLength={20}
                  />
                </div>
              ) : (
                <span
                  className="chatbot-name"
                  onClick={handleNameEdit}
                  title="Click to edit name"
                >
                  {botName}
                  <span className="edit-icon">✏️</span>
                </span>
              )}
            </div>
            <div className="chatbot-controls">{getWindowControls()}</div>
          </div>
          {windowState !== "minimized" && (
            <>
              <div className="chatbot-messages">
                {messages.length === 0 && (
                  <div className="chatbot-empty">
                    Ask me anything!
                    <div className="chatbot-welcome-animation">👋</div>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chatbot-msg ${msg.isBot ? "bot" : "user"}`}
                  >
                    <span className="chatbot-msg-sender">{msg.sender}:</span>{" "}
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chatbot-input-row">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Message ${botName}...`}
                  disabled={loading}
                  className="chatbot-input"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="chatbot-send-btn"
                >
                  {loading ? (
                    <span className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
