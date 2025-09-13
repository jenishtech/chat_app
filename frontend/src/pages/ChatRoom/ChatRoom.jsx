import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./ChatRoom.css";
import {
  FaThumbtack,
  FaBars,
  FaTimes,
  FaClock,
  FaPaperPlane,
  FaImage,
} from "react-icons/fa";
import { showToast } from "../../components/ToastContainer";
import Poll from "../../components/Poll";
import CreatePollModal from "../../components/CreatePollModal";
import MessageBubble from "../../components/ChatRoom/MessageBubble";
import Sidebar from "../../components/ChatRoom/Sidebar";
import ChatInput from "../../components/ChatRoom/ChatInput";
import Modals from "../../components/ChatRoom/Modals";
import AvatarEditor from "../../components/AvatarEditor/AvatarEditor";
import BackgroundSelector from "../../components/BackgroundSelector/BackgroundSelector";
import { renderAvatar, renderGroupAvatar } from "../../utils/avatarUtils.jsx";
import EmojiPicker from "emoji-picker-react";

const API = import.meta.env.VITE_API_URL;
const socket = io(`${API}`);
const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "👏"];
const DEFAULT_AVATAR = null; // fallback to FaUserCircle if not set

const ChatRoom = () => {
  const [username] = useState(() => localStorage.getItem("username") || "");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [privateChats, setPrivateChats] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupChats, setGroupChats] = useState({});
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [reactionBox, setReactionBox] = useState({
    open: false,
    msgId: null,
    x: 0,
    y: 0,
  });
  const [replyTo, setReplyTo] = useState(null);
  const [forwardModal, setForwardModal] = useState({ open: false, msg: null });
  const [forwardTarget, setForwardTarget] = useState({
    user: null,
    group: null,
    public: false,
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [showPrivateChats, setShowPrivateChats] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  const [editMessageText, setEditMessageText] = useState("");
  const [editModal, setEditModal] = useState({ open: false, msg: null });
  const [editSuccess, setEditSuccess] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [bioEditModal, setBioEditModal] = useState({ open: false, text: "" });
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinnedPrivateChats, setPinnedPrivateChats] = useState(() => {
    const saved = localStorage.getItem(`pinnedPrivateChats_${username}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [pinnedGroupChats, setPinnedGroupChats] = useState(() => {
    const saved = localStorage.getItem(`pinnedGroupChats_${username}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [groupEditModal, setGroupEditModal] = useState({
    open: false,
    groupName: "",
    newGroupName: "",
    description: "",
    selectedFile: null,
    previewUrl: null,
    members: [],
    showMemberSelector: false,
    showAdminSelector: false,
  });

  // Mention-related state
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  // Poll-related state
  const [polls, setPolls] = useState({});
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);

  // Avatar editor state
  const [avatarEditor, setAvatarEditor] = useState({
    isOpen: false,
    imageFile: null,
    type: 'user',
    groupName: '', // Add groupName for group avatars
    key: null // Add key to force re-render
  });

  // Background selector state
  const [backgroundSelector, setBackgroundSelector] = useState({
    isOpen: false
  });

  // Chat background state
  const [chatBackground, setChatBackground] = useState(() => {
    const saved = localStorage.getItem(`chatBackground_${username}`);
    return saved ? JSON.parse(saved) : { id: 'default', name: 'Default', url: null, type: 'built-in' };
  });

  // Temporary message state
  const [isTemporaryMessage, setIsTemporaryMessage] = useState(false);
  const [temporaryMessageDuration, setTemporaryMessageDuration] = useState(60);
  const [showTemporaryMessageOptions, setShowTemporaryMessageOptions] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Add refs for selectedUser and username ---
  const selectedUserRef = useRef(selectedUser);
  const usernameRef = useRef(username);

  // Wrapper functions to save chat selection to localStorage
  const setSelectedUserWithPersistence = (user) => {
    setSelectedUser(user);
    if (user) {
      localStorage.setItem(`selectedUser_${username}`, user);
      localStorage.removeItem(`selectedGroup_${username}`);
    } else {
      localStorage.removeItem(`selectedUser_${username}`);
    }
  };

  const setSelectedGroupWithPersistence = (group) => {
    setSelectedGroup(group);
    if (group) {
      localStorage.setItem(`selectedGroup_${username}`, group);
      localStorage.removeItem(`selectedUser_${username}`);
    } else {
      localStorage.removeItem(`selectedGroup_${username}`);
    }
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // Restore chat selection on mount and when username changes
  useEffect(() => {
    if (username) {
      const savedUser = localStorage.getItem(`selectedUser_${username}`);
      const savedGroup = localStorage.getItem(`selectedGroup_${username}`);

      // Only restore if we have groups and users loaded
      if (groups.length > 0 && users.length > 0) {
        if (savedGroup) {
          // Check if the saved group still exists and user is still a member
          const group = groups.find((g) => g.name === savedGroup);
          if (group && group.members.includes(username)) {
            setSelectedGroupWithPersistence(savedGroup);
            setSelectedGroupMembers(group.members || []);
          } else {
            // Group no longer exists or user is no longer a member, clear the selection
            localStorage.removeItem(`selectedGroup_${username}`);
          }
        } else if (savedUser) {
          // Check if the saved user still exists
          const userExists = users.some((u) => u.username === savedUser);
          if (userExists) {
            setSelectedUserWithPersistence(savedUser);
          } else {
            // User no longer exists, clear the selection
            localStorage.removeItem(`selectedUser_${username}`);
          }
        }
      }
    }
  }, [username, groups, users]);

  // Load appropriate background when chat changes
  useEffect(() => {
    if (username) {
      // First check for global background
      const globalBackground = localStorage.getItem(`chatBackground_global_${username}`);
      
      if (globalBackground) {
        setChatBackground(JSON.parse(globalBackground));
        return;
      }

      // If no global background, check for chat-specific background
      const currentChatKey = selectedGroup ? `group_${selectedGroup}` : `user_${selectedUser}`;
      const chatSpecificBackground = localStorage.getItem(`chatBackground_${username}_${currentChatKey}`);
      
      if (chatSpecificBackground) {
        setChatBackground(JSON.parse(chatSpecificBackground));
      } else {
        // Default background
        setChatBackground({ id: 'default', name: 'Default', url: null, type: 'built-in' });
      }
    }
  }, [username, selectedGroup, selectedUser]);

  // Helper to get avatar for a username
  const getAvatarUrl = (uname) => {
    if (uname === username) return avatarUrl;
    const userObj = users.find((u) => u.username === uname);
    return userObj?.avatarUrl || null;
  };
  // Helper to get bio for a username
  const getBio = (uname) => {
    if (uname === username) return bio;
    const userObj = users.find((u) => u.username === uname);
    return userObj?.bio || "";
  };

  // Bio update handler
  const handleBioSave = async () => {
    try {
      const res = await fetch(`${API}/api/auth/update-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio: bioEditModal.text }),
      });
      const data = await res.json();
      if (data.bio !== undefined) setBio(data.bio);
      setBioEditModal({ open: false, text: "" });
    } catch {
      alert("Failed to update bio");
    }
  };

  // Open bio edit modal
  const openBioEditModal = () => {
    setBioEditModal({ open: true, text: bio });
  };

  // Cancel bio edit
  const cancelBioEdit = () => {
    setBioEditModal({ open: false, text: "" });
  };

  // Open group edit modal
  const openGroupEditModal = (groupName) => {
    const group = groups.find((g) => g.name === groupName);
    setGroupEditModal({
      open: true,
      groupName,
      newGroupName: groupName,
      description: group?.description || "",
      selectedFile: null,
      previewUrl: null,
      members: group?.members || [],
      showMemberSelector: false,
      showAdminSelector: false,
    });
  };

  // Handle group avatar file selection
  const handleGroupAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Open avatar editor for group avatar with unique key
      setAvatarEditor({
        isOpen: true,
        imageFile: file,
        type: 'group',
        groupName: groupEditModal.groupName, // Add group name
        key: Date.now() // Generate unique key
      });
      
      // Clear the file input value so the same file can be selected again
      e.target.value = '';
    }
  };

  // Handle avatar editor save for group avatar
  const handleGroupAvatarEditorSave = async (editedFile) => {
    setGroupEditModal((prev) => ({
      ...prev,
      selectedFile: editedFile,
      previewUrl: URL.createObjectURL(editedFile),
    }));
    setAvatarEditor({ isOpen: false, imageFile: null, type: 'group', groupName: '', key: null });
  };

  // Handle avatar editor cancel for group
  const handleGroupAvatarEditorCancel = () => {
    setAvatarEditor({ isOpen: false, imageFile: null, type: 'group', groupName: '', key: null });
  };

  // Save group changes
  const saveGroupChanges = async () => {
    const { groupName, newGroupName, description, selectedFile, members } =
      groupEditModal;

    try {
      let updatedGroupName = groupName;

      // Update group name if changed
      if (newGroupName !== groupName && newGroupName.trim()) {
        const nameRes = await fetch(`${API}/api/group-name`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldGroupName: groupName,
            newGroupName: newGroupName.trim(),
          }),
        });
        if (!nameRes.ok) {
          const errorData = await nameRes.json();
          throw new Error(errorData.error || "Failed to update group name");
        }
        updatedGroupName = newGroupName.trim();

        // Update selectedGroup if it's the current group being edited
        if (selectedGroup === groupName) {
          setSelectedGroupWithPersistence(updatedGroupName);
        }

        // Update groupChats to use new group name
        setGroupChats((prev) => {
          const updated = { ...prev };
          if (updated[groupName]) {
            updated[updatedGroupName] = updated[groupName];
            delete updated[groupName];
          }
          return updated;
        });
      }

      // Update description if changed
      if (
        description !== groups.find((g) => g.name === groupName)?.description
      ) {
        const descRes = await fetch(`${API}/api/group-description`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupName: updatedGroupName, description }),
        });
        if (!descRes.ok) throw new Error("Failed to update description");
      }

      // Update members if changed
      const currentGroup = groups.find((g) => g.name === groupName);
      if (
        JSON.stringify(members.sort()) !==
        JSON.stringify(currentGroup?.members?.sort())
      ) {
        const membersRes = await fetch(`${API}/api/group-members`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupName: updatedGroupName, members }),
        });
        if (!membersRes.ok) throw new Error("Failed to update members");
      }

      // Upload avatar if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        formData.append("groupName", updatedGroupName);

        const avatarRes = await fetch(`${API}/api/group-avatar`, {
          method: "POST",
          body: formData,
        });
        if (!avatarRes.ok) throw new Error("Failed to upload avatar");
      }

      setGroupEditModal({
        open: false,
        groupName: "",
        newGroupName: "",
        description: "",
        selectedFile: null,
        previewUrl: null,
        members: [],
        showMemberSelector: false,
        showAdminSelector: false,
      });
      // Groups list will be updated via socket
    } catch (error) {
      alert("Failed to save group changes: " + error.message);
    }
  };

  // Cancel group edit
  const cancelGroupEdit = () => {
    setGroupEditModal({
      open: false,
      groupName: "",
      newGroupName: "",
      description: "",
      selectedFile: null,
      previewUrl: null,
      members: [],
      showMemberSelector: false,
      showAdminSelector: false,
    });
  };

  // Remove selected avatar
  const removeSelectedAvatar = () => {
    setGroupEditModal((prev) => ({
      ...prev,
      selectedFile: null,
      previewUrl: null,
    }));
  };

  // Toggle member selector
  const toggleMemberSelector = () => {
    setGroupEditModal((prev) => ({
      ...prev,
      showMemberSelector: !prev.showMemberSelector,
    }));
  };

  // Add member to group
  const addMember = (memberName) => {
    if (!groupEditModal.members.includes(memberName)) {
      setGroupEditModal((prev) => ({
        ...prev,
        members: [...prev.members, memberName],
      }));
    }
  };

  // Remove member from group
  const removeMember = (memberName) => {
    setGroupEditModal((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m !== memberName),
    }));
  };

  // Admin management functions
  const handleAddAdmin = async (targetUser) => {
    try {
      const response = await fetch(`${API}/api/group/admin/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: groupEditModal.groupName,
          username: username,
          targetUser: targetUser,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast.success(data.message);
        // Close admin selector
        setGroupEditModal((prev) => ({
          ...prev,
          showAdminSelector: false,
        }));
      } else {
        showToast.error(data.error || "Failed to add admin");
      }
    } catch {
      showToast.error("Failed to add admin");
    }
  };

  const handleRemoveAdmin = async (targetUser) => {
    try {
      const response = await fetch(`${API}/api/group/admin/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: groupEditModal.groupName,
          username: username,
          targetUser: targetUser,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast.success(data.message);
      } else {
        showToast.error(data.error || "Failed to remove admin");
      }
    } catch {
      showToast.error("Failed to remove admin");
    }
  };

  // Toggle admin selector
  const toggleAdminSelector = () => {
    setGroupEditModal((prev) => ({
      ...prev,
      showAdminSelector: !prev.showAdminSelector,
    }));
  };

  // Check if user is admin or creator (unused but kept for future use)
  const _isUserAdmin = (groupName) => {
    const group = groups.find((g) => g.name === groupName);
    return group && (group.admins?.includes(username) || group.creator === username);
  };

  // Check if user is creator
  const isUserCreator = (groupName) => {
    const group = groups.find((g) => g.name === groupName);
    return group && group.creator === username;
  };

  // Check if user is admin (including creator)
  const isUserAdminOrCreator = (groupName) => {
    const group = groups.find((g) => g.name === groupName);
    return group && (group.admins?.includes(username) || group.creator === username);
  };

  // Delete group
  const handleDeleteGroup = async () => {
    const { groupName } = groupEditModal;

    if (
      !window.confirm(
        `Are you sure you want to delete the group "#${groupName}"? This action cannot be undone and will delete all messages in this group.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API}/api/group`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete group");
      }

      // Close the modal
      setGroupEditModal({
        open: false,
        groupName: "",
        newGroupName: "",
        description: "",
        selectedFile: null,
        previewUrl: null,
        members: [],
        showMemberSelector: false,
        showAdminSelector: false,
      });

      // If the deleted group was currently selected, clear the selection
      if (selectedGroup === groupName) {
        setSelectedGroupWithPersistence(null);
        setGroupChats((prev) => {
          const updated = { ...prev };
          delete updated[groupName];
          return updated;
        });
      }
    } catch (error) {
      alert("Failed to delete group: " + error.message);
    }
  };

  // Leave group
  const handleLeaveGroup = async () => {
    const { groupName } = groupEditModal;

    if (
      !window.confirm(
        `Are you sure you want to leave the group "#${groupName}"? You will no longer be able to see messages from this group.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API}/api/leave-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to leave group");
      }

      // Close the modal
      setGroupEditModal({
        open: false,
        groupName: "",
        newGroupName: "",
        description: "",
        selectedFile: null,
        previewUrl: null,
        members: [],
        showMemberSelector: false,
        showAdminSelector: false,
      });

      // If the left group was currently selected, clear the selection
      if (selectedGroup === groupName) {
        setSelectedGroupWithPersistence(null);
        setGroupChats((prev) => {
          const updated = { ...prev };
          delete updated[groupName];
          return updated;
        });
      }

      showToast.success("Successfully left the group!");
    } catch (error) {
      showToast.error("Failed to leave group: " + error.message);
    }
  };

  useEffect(() => {
    socket.on("online_users", (online) => {
      setOnlineUsers(online);
    });

    // Listen for message_deleted event
    socket.on("message_deleted", (msgId) => {
      setChatLog((prev) =>
        prev.map((msg) => (msg._id === msgId ? { ...msg, deleted: true } : msg))
      );
      setPrivateChats((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map((msg) =>
            msg._id === msgId ? { ...msg, deleted: true } : msg
          );
        }
        return updated;
      });
      setGroupChats((prev) => {
        const updated = {};
        for (const group in prev) {
          updated[group] = prev[group].map((msg) =>
            msg._id === msgId ? { ...msg, deleted: true } : msg
          );
        }
        return updated;
      });
    });

    // Listen for message_expired event (temporary messages)
    socket.on("message_expired", (msgId) => {
      setChatLog((prev) =>
        prev.map((msg) =>
          msg._id === msgId ? { ...msg, deleted: true, expired: true } : msg
        )
      );
      setPrivateChats((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map((msg) =>
            msg._id === msgId ? { ...msg, deleted: true, expired: true } : msg
          );
        }
        return updated;
      });
      setGroupChats((prev) => {
        const updated = {};
        for (const group in prev) {
          updated[group] = prev[group].map((msg) =>
            msg._id === msgId ? { ...msg, deleted: true, expired: true } : msg
          );
        }
        return updated;
      });
    });

    // Typing indicator
    socket.on("typing", ({ from, group, username }) => {
      if (group) {
        setTypingUsers((prev) => [...new Set([...prev, username])]);
      } else if (from) {
        setTypingUsers((prev) => [...new Set([...prev, from])]);
      }
    });
    socket.on("stop_typing", ({ from, group, username }) => {
      if (group) {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      } else if (from) {
        setTypingUsers((prev) => prev.filter((u) => u !== from));
      }
    });
    // Message receipts
    socket.on("message_receipt_update", ({ messageId, seenBy }) => {
      // Update in private chats
      setPrivateChats((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].map((msg) =>
            msg._id === messageId ? { ...msg, seenBy } : msg
          );
        }
        return updated;
      });

      // Force re-render to ensure UI updates
      setForceUpdate((prev) => prev + 1);
    });

    // Listen for reaction updates
    socket.on("message_reaction_update", ({ messageId, reactions }) => {
      // Update in all chat types
      setChatLog((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
      setPrivateChats((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map((msg) =>
            msg._id === messageId ? { ...msg, reactions } : msg
          );
        }
        return updated;
      });
      setGroupChats((prev) => {
        const updated = {};
        for (const group in prev) {
          updated[group] = prev[group].map((msg) =>
            msg._id === messageId ? { ...msg, reactions } : msg
          );
        }
        return updated;
      });
    });

    // Listen for pin/unpin updates
    socket.on(
      "message_pinned",
      ({ messageId, pinned, pinnedBy, pinnedAt, pinOrder }) => {
        // Update in group chats
        setGroupChats((prev) => {
          const updated = {};
          for (const group in prev) {
            updated[group] = prev[group].map((msg) =>
              msg._id === messageId
                ? { ...msg, pinned, pinnedBy, pinnedAt, pinOrder }
                : msg
            );
          }
          return updated;
        });

        // Update pinned messages list for current group
        if (selectedGroup) {
          setShowPinnedModal(true);
        }
      }
    );

    return () => {
      socket.off("online_users");
      socket.off("message_deleted");
      socket.off("message_expired");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("message_receipt_update");
      socket.off("message_reaction_update");
      socket.off("message_pinned");
      socket.off("group_renamed");
      socket.off("group_deleted");
      socket.off("user_left_group");
    };
  }, []);

  // Send join event
  useEffect(() => {
    if (username) {
      socket.emit("join", username);
    }

    // Cleanup typing when component unmounts or username changes
    return () => {
      if (selectedGroup) {
        socket.emit("stop_typing", { group: selectedGroup, username });
      } else if (selectedUser) {
        socket.emit("stop_typing", { to: selectedUser, username });
      }
    };
  }, [username]);

  // Listen to server events
  useEffect(() => {
    socket.on("users_list", (userList) => {
      // userList is now array of { username, avatarUrl, bio }
      setUsers(userList.filter((u) => u.username !== username));
      // Set own avatar and bio if present
      const me = userList.find((u) => u.username === username);
      if (me) {
        setAvatarUrl(me.avatarUrl || "");
        setBio(me.bio || "");
      }
    });
    socket.on(
      "user_avatar_updated",
      ({ username: uname, avatarUrl: url, bio: b }) => {
        if (uname === username) {
          setAvatarUrl(url);
          setBio(b || "");
        }
        setUsers((prev) =>
          prev.map((u) =>
            u.username === uname ? { ...u, avatarUrl: url, bio: b } : u
          )
        );
      }
    );
    socket.on("groups_list", (serverGroups) => {
      setGroups(serverGroups);
    });

    // Listen for group rename events
    socket.on("group_renamed", ({ oldName, newName }) => {
      // Update selectedGroup if it's the renamed group
      if (selectedGroup === oldName) {
        setSelectedGroupWithPersistence(newName);
      }

      // Update groupChats to use new group name
      setGroupChats((prev) => {
        const updated = { ...prev };
        if (updated[oldName]) {
          updated[newName] = updated[oldName];
          delete updated[oldName];
        }
        return updated;
      });

      // Force re-render to ensure UI updates
      setForceUpdate((prev) => prev + 1);
    });

    // Listen for group deletion events
    socket.on("group_deleted", ({ groupName }) => {
      // If the deleted group was currently selected, clear the selection
      if (selectedGroup === groupName) {
        setSelectedGroupWithPersistence(null);
      }

      // Remove the group from groupChats
      setGroupChats((prev) => {
        const updated = { ...prev };
        delete updated[groupName];
        return updated;
      });

      // Force re-render to ensure UI updates
      setForceUpdate((prev) => prev + 1);
    });

    // Listen for user leaving group events
    socket.on("user_left_group", ({ groupName, username: leftUsername }) => {
      // If the current user left the group, handle it
      if (leftUsername === username) {
        // If the left group was currently selected, clear the selection
        if (selectedGroup === groupName) {
          setSelectedGroupWithPersistence(null);
        }

        // Remove the group from groupChats
        setGroupChats((prev) => {
          const updated = { ...prev };
          delete updated[groupName];
          return updated;
        });

        // Force re-render to ensure UI updates
        setForceUpdate((prev) => prev + 1);
      }
    });

    socket.on("receive_message_history", (msgs) => {
      // Check for expired temporary messages in history
      const now = new Date();
      const processedMsgs = msgs.map((msg) => {
        if (
          msg.isTemporary &&
          msg.expiresAt &&
          new Date(msg.expiresAt) <= now &&
          !msg.expired
        ) {
          return { ...msg, expired: true, deleted: true };
        }
        return msg;
      });
      setChatLog(processedMsgs);
    });

    // Listen for new messages
    socket.on("receive_message", (data) => {
      // Only add messages with _id (from server)
      if (!data._id) return;

      // Check if temporary message has already expired
      if (data.isTemporary && data.expiresAt) {
        const now = new Date();
        const expiry = new Date(data.expiresAt);
        if (expiry <= now) {
          // Message has already expired, mark it as expired
          data.expired = true;
          data.deleted = true;
        }
      }
      //if message is from a group
      if (data.group) {
        setGroupChats((prev) => {
          const updated = { ...prev };
          if (!updated[data.group]) updated[data.group] = [];
          updated[data.group] = [...updated[data.group], data];
          return updated;
        });
      }
      //if message is private
      else if (data.to && data.to !== "All") {
        const chatKey =
          data.sender === usernameRef.current ? data.to : data.sender;
        setPrivateChats((prev) => {
          const updated = { ...prev };
          if (!updated[chatKey]) updated[chatKey] = [];
          // Prevent duplicate message if already present
          if (!updated[chatKey].some((msg) => msg._id === data._id)) {
            updated[chatKey] = [...updated[chatKey], data];
          }
          return updated;
        });
        // Send seen receipt immediately when receiving a message in active chat
        if (
          selectedUserRef.current === chatKey &&
          data.sender !== usernameRef.current &&
          data._id &&
          !(data.seenBy || []).includes(usernameRef.current)
        ) {
          // Small delay to ensure message is processed first
          setTimeout(() => {
            socket.emit("message_seen", {
              messageId: data._id,
              username: usernameRef.current,
            });
          }, 100);
        }
      }
      //if message is public
      else {
        setChatLog((prev) => {
          if (!prev.some((msg) => msg._id === data._id)) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    // Handle mention notifications
    socket.on("mention_notification", (data) => {
      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.message, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "mention",
        });
      }

      // Show toast notification for mentions in other groups
      if (data.group !== selectedGroup) {
        showToast.mention(`You were mentioned: ${data.message}`);
      }
    });

    // Poll event handlers
    socket.on("poll_created", ({ poll }) => {
      setPolls((prev) => ({
        ...prev,
        [poll._id]: poll,
      }));
      // Only show success toast to the poll creator
      if (poll.createdBy === username) {
        showToast.success("Poll created successfully!");
      }
    });

    socket.on("poll_updated", ({ pollId, poll }) => {
      setPolls((prev) => ({
        ...prev,
        [pollId]: poll,
      }));
    });

    socket.on("poll_closed", ({ pollId, poll }) => {
      setPolls((prev) => ({
        ...prev,
        [pollId]: poll,
      }));
      // No notification for poll closure (including expiration)
    });

    // Listen for message edits
    socket.on("message_edited", (updatedMsg) => {
      console.log("Message edited received:", updatedMsg); // Debug log
      console.log("Current chat states:", {
        chatLogLength: chatLog.length,
        privateChatsKeys: Object.keys(privateChats),
        groupChatsKeys: Object.keys(groupChats),
      });

      // Update in all chat types
      setChatLog((prev) => {
        const updated = prev.map((msg) =>
          msg._id === updatedMsg._id ? updatedMsg : msg
        );
        console.log("Updated chatLog:", updated.length, "messages");
        return updated;
      });

      setPrivateChats((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map((msg) =>
            msg._id === updatedMsg._id ? updatedMsg : msg
          );
        }
        console.log("Updated privateChats:", Object.keys(updated));
        return updated;
      });

      setGroupChats((prev) => {
        const updated = {};
        for (const group in prev) {
          updated[group] = prev[group].map((msg) =>
            msg._id === updatedMsg._id ? updatedMsg : msg
          );
        }
        console.log("Updated groupChats:", Object.keys(updated));
        return updated;
      });

      // Force a re-render to ensure UI updates
      setForceUpdate((prev) => prev + 1);
    });

    // Listen for view-once updates
    socket.on("view_once_updated", ({ messageId, viewedBy }) => {
      const updateMessage = (msg) => {
        if (msg._id === messageId) {
          return { ...msg, viewedBy };
        }
        return msg;
      };

      // Update in public chat
      setChatLog((prev) => prev.map(updateMessage));

      // Update in private chats
      setPrivateChats((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map(updateMessage);
        }
        return updated;
      });

      // Update in group chats
      setGroupChats((prev) => {
        const updated = {};
        for (const group in prev) {
          updated[group] = prev[group].map(updateMessage);
        }
        return updated;
      });
    });

    // Listen for scheduled message confirmation
    socket.on("message_scheduled", ({ scheduledAt }) => {
      showToast.success(
        `Message scheduled for ${new Date(scheduledAt).toLocaleString()}`
      );
    });

    // Listen for scheduled message sent notification
    socket.on("scheduled_message_sent", ({ messageId, scheduledAt }) => {
      showToast.success(
        `✅ Scheduled message sent at ${new Date(scheduledAt).toLocaleString()}`
      );

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Scheduled Message Sent", {
          body: `Your scheduled message was sent at ${new Date(
            scheduledAt
          ).toLocaleString()}`,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "scheduled_message",
        });
      }

      // Update the message to show it's been sent
      const updateMessage = (msg) => {
        if (msg._id === messageId) {
          return { ...msg, scheduled: true };
        }
        return msg;
      };

      // Update in public chat
      setChatLog((prev) => prev.map(updateMessage));

      // Update in private chats
      setPrivateChats((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map(updateMessage);
        }
        return updated;
      });

      // Update in group chats
      setGroupChats((prev) => {
        const updated = {};
        for (const group in prev) {
          updated[group] = prev[group].map(updateMessage);
        }
        return updated;
      });
    });

    return () => {
      socket.off("users_list");
      socket.off("groups_list");
      socket.off("receive_message_history");
      socket.off("receive_message");
      socket.off("user_avatar_updated");
      socket.off("message_edited");
      socket.off("group_renamed");
      socket.off("mention_notification");
      socket.off("poll_created");
      socket.off("poll_updated");
      socket.off("poll_closed");
      socket.off("view_once_updated");
      socket.off("message_scheduled");
      socket.off("scheduled_message_sent");
    };
  }, [username]);

  // Load chat histories
  useEffect(() => {
    socket.on("receive_private_message_history", (msgs) => {
      // Check for expired temporary messages in private chat history
      const now = new Date();
      const processedMsgs = msgs.map((msg) => {
        if (
          msg.isTemporary &&
          msg.expiresAt &&
          new Date(msg.expiresAt) <= now &&
          !msg.expired
        ) {
          return { ...msg, expired: true, deleted: true };
        }
        return msg;
      });

      const chats = {};
      processedMsgs.forEach((msg) => {
        const chatKey = msg.sender === username ? msg.to : msg.sender;
        if (!chats[chatKey]) chats[chatKey] = [];
        chats[chatKey].push(msg);
      });
      setPrivateChats(chats);
    });

    socket.on("receive_group_message_history", ({ group, messages }) => {
      // Check for expired temporary messages in group chat history
      const now = new Date();
      const processedMessages = messages.map((msg) => {
        if (
          msg.isTemporary &&
          msg.expiresAt &&
          new Date(msg.expiresAt) <= now &&
          !msg.expired
        ) {
          return { ...msg, expired: true, deleted: true };
        }
        return msg;
      });

      setGroupChats((prev) => ({ ...prev, [group]: processedMessages }));
    });

    return () => {
      socket.off("receive_private_message_history");
      socket.off("receive_group_message_history");
    };
  }, [username]);

  // Smart auto scroll - only scroll if user is already at bottom
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatBoxRef = useRef(null);

  const checkIfAtBottom = () => {
    if (!chatBoxRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const threshold = 50; // 50px threshold to consider "at bottom"
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const handleScroll = () => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);

    // Show scroll button if not at bottom and there are messages
    const hasMessages =
      (selectedGroup
        ? groupChats[selectedGroup]?.length
        : selectedUser
        ? privateChats[selectedUser]?.length
        : chatLog.length) > 0;
    setShowScrollButton(!atBottom && hasMessages);
  };

  const scrollToBottom = (smooth = true) => {
    if (chatBoxRef.current) {
      if (smooth) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }
  };

  // Auto scroll only when user is at bottom and new messages arrive
  useEffect(() => {
    // Don't auto-scroll if user is editing a message
    if (editModal.open) return;

    if (isAtBottom) {
      scrollToBottom(true); // Smooth scroll for new messages
    } else {
      // Show scroll button when new messages arrive and user is not at bottom
      setShowScrollButton(true);
    }
  }, [
    chatLog,
    privateChats,
    groupChats,
    selectedUser,
    selectedGroup,
    forceUpdate,
    editModal.open,
  ]);

  // Reset scroll state when switching chats
  useEffect(() => {
    setIsAtBottom(true);
    setShowScrollButton(false);
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      scrollToBottom(false); // Instant scroll when switching chats
    }, 100);
  }, [selectedUser, selectedGroup]);

  // Save pinned chats to localStorage
  useEffect(() => {
    localStorage.setItem(
      `pinnedPrivateChats_${username}`,
      JSON.stringify(pinnedPrivateChats)
    );
  }, [pinnedPrivateChats, username]);

  useEffect(() => {
    localStorage.setItem(
      `pinnedGroupChats_${username}`,
      JSON.stringify(pinnedGroupChats)
    );
  }, [pinnedGroupChats, username]);

  // Save chat background to localStorage
  useEffect(() => {
    localStorage.setItem(
      `chatBackground_${username}`,
      JSON.stringify(chatBackground)
    );
  }, [chatBackground, username]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Emit seen receipts (private chat only) - more reliable version
  useEffect(() => {
    if (selectedUser && privateChats[selectedUser]) {
      // Send seen receipts for all unread messages in the current chat
      const unreadMessages = privateChats[selectedUser].filter(
        (msg) =>
          msg._id &&
          msg.sender !== username &&
          !(msg.seenBy || []).includes(username)
      );

      unreadMessages.forEach((msg) => {
        // Small delay to ensure proper processing
        setTimeout(() => {
          socket.emit("message_seen", { messageId: msg._id, username });
        }, 200);
      });
    }
  }, [privateChats, selectedUser, username, socket]);

  // Send message
  const sendMessage = async () => {
    // Stop typing when sending message
    if (selectedGroup) {
      socket.emit("stop_typing", { group: selectedGroup, username });
    } else if (selectedUser) {
      socket.emit("stop_typing", { to: selectedUser, username });
    }

    if (message.trim() !== "" || media || forwardModal.msg) {
      let msgData = { message, sender: username, timestamp: Date.now() };
      if (replyTo) msgData.replyTo = replyTo._id;

      // Add temporary message settings if enabled
      if (isTemporaryMessage) {
        msgData.isTemporary = true;
        msgData.expiresIn = temporaryMessageDuration;
      }

      // Add view-once settings if enabled (only for images)
      if (isViewOnce && media && media.type.startsWith("image")) {
        msgData.isViewOnce = true;
      }

      // Add scheduled message settings if enabled
      if (isScheduled && scheduledDateTime) {
        msgData.isScheduled = true;
        msgData.scheduledAt = scheduledDateTime;
      }

      if (forwardModal.msg) {
        msgData.forwardedFrom = forwardModal.msg.sender;
        // If no message typed, use the original message's text
        if (!message.trim()) {
          msgData.message = forwardModal.msg.message;
        }
        // If no new media attached, use the original media
        if (!media && forwardModal.msg.mediaUrl) {
          msgData.mediaUrl = forwardModal.msg.mediaUrl;
          msgData.mediaType = forwardModal.msg.mediaType;
        }
        // Set the target for forward
        if (forwardTarget.public) {
          msgData.to = "All";
        } else if (forwardTarget.user) {
          msgData.to = forwardTarget.user;
        } else if (forwardTarget.group) {
          msgData.group = forwardTarget.group;
        }
      }
      // Handle media upload
      if (media) {
        const formData = new FormData();
        formData.append("media", media);
        try {
          const res = await fetch(`${API}/api/upload`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            msgData.mediaUrl = data.url;
            msgData.mediaType = data.type;
          }
        } catch {
          showToast.error("Failed to upload media");
          return;
        }
      }
      if (forwardModal.msg) {
        // Forward: use forwardTarget
        socket.emit("send_message", msgData);
      } else if (selectedGroup) {
        msgData = { ...msgData, group: selectedGroup };
        socket.emit("send_message", msgData);
      } else if (selectedUser) {
        msgData = { ...msgData, to: selectedUser };
        socket.emit("send_message", msgData);
      } else {
        msgData = { ...msgData, to: "All" };
        socket.emit("send_message", msgData);
      }
      setMessage("");
      setMedia(null);
      setMediaPreview(null);
      setReplyTo(null);
      setForwardModal({ open: false, msg: null });
      setForwardTarget({ user: null, group: null, public: false });
      setIsTemporaryMessage(false);
      setIsViewOnce(false);
      setIsScheduled(false);
      setScheduledDateTime("");
      setShowScheduleModal(false);
    }
  };

  // Create group
  const handleCreateGroup = () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) return;
    socket.emit("create_group", {
      name: newGroupName.trim(),
      members: [username, ...newGroupMembers],
    });
    setNewGroupName("");
    setNewGroupMembers([]);
    setShowGroupForm(false);
    showToast.success("Group created successfully!");
  };

  // Media file select handler
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  // Avatar upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Open avatar editor for user avatar with unique key
    setAvatarEditor({
      isOpen: true,
      imageFile: file,
      type: 'user',
      groupName: '', // Empty for user avatars
      key: Date.now() // Generate unique key
    });
    
    // Clear the file input value so the same file can be selected again
    e.target.value = '';
  };

  // Handle avatar editor save for user avatar
  const handleAvatarEditorSave = async (editedFile) => {
    const formData = new FormData();
    formData.append("avatar", editedFile);
    formData.append("username", username);
    formData.append("bio", bio);
    
    try {
      const res = await fetch(`${API}/api/avatar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) setAvatarUrl(data.url);
      if (data.bio !== undefined) setBio(data.bio);
      showToast.success("Avatar updated successfully!");
    } catch {
      showToast.error("Failed to upload avatar");
    }
    
    setAvatarEditor({ isOpen: false, imageFile: null, type: 'user', groupName: '', key: null });
  };

  // Handle avatar editor cancel
  const handleAvatarEditorCancel = () => {
    setAvatarEditor({ isOpen: false, imageFile: null, type: 'user', groupName: '', key: null });
  };

  // Filtered users and groups for search
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  // Emoji picker handler
  const handleEmojiSelect = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  // Typing events
  const typingTimeout = useRef();
  // Mention detection and suggestion functions
  const detectMentions = (text, cursorPosition) => {
    if (!selectedGroup) return null;

    const beforeCursor = text.slice(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const group = groups.find((g) => g.name === selectedGroup);

      if (group) {
        const suggestions = [];

        // Add @all option
        if ("all".includes(query)) {
          suggestions.push({
            type: "all",
            display: "@all",
            username: "all",
            query,
          });
        }

        // Add group members
        group.members.forEach((member) => {
          if (member.toLowerCase().includes(query) && member !== username) {
            suggestions.push({
              type: "user",
              display: `@${member}`,
              username: member,
              query,
            });
          }
        });

        return {
          query,
          suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
          startIndex: mentionMatch.index,
        };
      }
    }

    return null;
  };

  const insertMention = (mention) => {
    const beforeMention = message.slice(
      0,
      mentionCursorPosition - mention.query.length - 1
    );
    const afterMention = message.slice(mentionCursorPosition);
    const newMessage = beforeMention + mention.display + " " + afterMention;

    setMessage(newMessage);
    setShowMentionSuggestions(false);
    setMentionSuggestions([]);
    setSelectedMentionIndex(0);

    // Focus back to input after a short delay to ensure state updates
    setTimeout(() => {
      const input = document.querySelector(".chat-input");
      if (input) {
        input.focus();
        const newCursorPosition =
          beforeMention.length + mention.display.length + 1;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setMessage(newValue);
    setMentionCursorPosition(cursorPosition);

    // Check for mentions only in group chats
    if (selectedGroup) {
      const mentionData = detectMentions(newValue, cursorPosition);

      if (mentionData && mentionData.suggestions.length > 0) {
        setMentionSuggestions(mentionData.suggestions);
        setShowMentionSuggestions(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionSuggestions(false);
        setMentionSuggestions([]);
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionSuggestions([]);
    }

    if (selectedGroup) {
      socket.emit("typing", { group: selectedGroup, username });
    } else if (selectedUser) {
      socket.emit("typing", { to: selectedUser, username });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit("stop_typing", { group: selectedGroup, username });
      } else if (selectedUser) {
        socket.emit("stop_typing", { to: selectedUser, username });
      }
    }, 1200);
  };

  // Handle reaction click
  const handleReaction = (msgId, emoji) => {
    socket.emit("react_message", { messageId: msgId, username, emoji });
    setReactionBox({ open: false, msgId: null, x: 0, y: 0 });
  };

  // Handle edit message
  const handleEditMessage = (msg) => {
    setEditModal({ open: true, msg });
    setEditMessageText(msg.message);
  };

  // Handle pin/unpin message
  const handlePinMessage = (msg) => {
    if (msg.pinned) {
      socket.emit("unpin_message", { messageId: msg._id, username });
    } else {
      socket.emit("pin_message", { messageId: msg._id, username });
    }
  };

  // Save edited message
  const saveEditedMessage = () => {
    if (editMessageText.trim() && editModal.msg) {
      console.log("Saving edited message:", {
        messageId: editModal.msg._id,
        newMessage: editMessageText.trim(),
      });
      socket.emit("edit_message", {
        messageId: editModal.msg._id,
        newMessage: editMessageText.trim(),
      });
      setEditModal({ open: false, msg: null });
      setEditMessageText("");
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000); // Hide after 3 seconds
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditModal({ open: false, msg: null });
    setEditMessageText("");
  };

  // Find a message by id in all chats
  const findMessageById = (id) => {
    const allMsgs = [
      ...chatLog,
      ...Object.values(privateChats).flat(),
      ...Object.values(groupChats).flat(),
    ];
    return allMsgs.find((m) => m._id === id);
  };

  // Forward modal selection handler
  const handleForwardSelect = (type, value) => {
    if (type === "public") {
      setForwardTarget({ user: null, group: null, public: true });
    } else if (type === "user") {
      setForwardTarget({ user: value, group: null, public: false });
    } else if (type === "group") {
      setForwardTarget({ user: null, group: value, public: false });
    }
  };

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking overlay
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Background selector functions
  const openBackgroundSelector = () => {
    setBackgroundSelector({ isOpen: true });
  };

  const closeBackgroundSelector = () => {
    setBackgroundSelector({ isOpen: false });
  };

  const handleBackgroundSelect = (background, applyTo) => {
    if (applyTo === 'all') {
      // Apply to all chats - store in localStorage with a global key
      localStorage.setItem(`chatBackground_global_${username}`, JSON.stringify(background));
      setChatBackground(background);
    } else {
      // Apply to current chat only
      const currentChatKey = selectedGroup ? `group_${selectedGroup}` : `user_${selectedUser}`;
      localStorage.setItem(`chatBackground_${username}_${currentChatKey}`, JSON.stringify(background));
      setChatBackground(background);
    }
  };

  // Get chat background style
  const getChatBackgroundStyle = () => {
    if (chatBackground.id === 'default') {
      return { background: '#f9f9f9' };
    }
    
    // Handle custom backgrounds
    if (chatBackground.type === 'custom' && chatBackground.customData) {
      return generateCustomBackgroundStyle(chatBackground.customData);
    }
    
    if (chatBackground.url) {
      return {
        backgroundImage: `url(${chatBackground.url.startsWith('data:') ? chatBackground.url : API + chatBackground.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      };
    }
    
    return { background: '#f9f9f9' };
  };

  // Generate custom background style
  const generateCustomBackgroundStyle = (customData) => {
    const { color1, color2, direction, pattern } = customData;
    
    if (pattern === 'none') {
      return {
        background: `linear-gradient(${direction}, ${color1}, ${color2})`,
        backgroundAttachment: 'fixed'
      };
    }
    
    if (pattern === 'radial') {
      return {
        background: `radial-gradient(circle, ${color1}, ${color2})`,
        backgroundAttachment: 'fixed'
      };
    }
    
    if (pattern === 'stripes') {
      return {
        background: `repeating-linear-gradient(45deg, ${color1}, ${color1} 10px, ${color2} 10px, ${color2} 20px)`,
        backgroundAttachment: 'fixed'
      };
    }
    
    if (pattern === 'dots') {
      return {
        background: `
          radial-gradient(circle at 25% 25%, ${color2} 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, ${color2} 2px, transparent 2px),
          ${color1}
        `,
        backgroundSize: '20px 20px, 20px 20px, 100% 100%',
        backgroundAttachment: 'fixed'
      };
    }
    
    if (pattern === 'waves') {
      return {
        background: `
          linear-gradient(45deg, ${color1} 25%, transparent 25%),
          linear-gradient(-45deg, ${color2} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${color1} 75%),
          linear-gradient(-45deg, transparent 75%, ${color2} 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundAttachment: 'fixed'
      };
    }
    
    return {
      background: `linear-gradient(${direction}, ${color1}, ${color2})`,
      backgroundAttachment: 'fixed'
    };
  };

  // Close mention suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMentionSuggestions &&
        !event.target.closest(".chat-input-container")
      ) {
        setShowMentionSuggestions(false);
        setMentionSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMentionSuggestions]);

  // Poll functions
  const handleCreatePoll = (pollData) => {
    socket.emit("create_poll", pollData);
  };

  const handleVotePoll = (pollId, optionIndex) => {
    socket.emit("vote_poll", { pollId, optionIndex, username });
  };

  const handleClosePoll = (pollId) => {
    socket.emit("close_poll", { pollId, username });
  };

  // Load polls for current group
  useEffect(() => {
    if (selectedGroup) {
      fetch(`${API}/api/polls/${selectedGroup}`)
        .then((res) => res.json())
        .then((pollsData) => {
          const pollsMap = {};
          pollsData.forEach((poll) => {
            pollsMap[poll._id] = poll;
          });
          setPolls(pollsMap);
        })
        .catch((error) => {
          console.error("Error loading polls:", error);
        });
    }
  }, [selectedGroup, API]);

  // Pin/Unpin chat functions
  const handlePinChat = (chatType, chatName) => {
    if (chatType === "user") {
      // Handle private chat pinning
      const isPinned = pinnedPrivateChats.some(
        (chat) => chat.name === chatName
      );

      if (isPinned) {
        // Unpin chat
        setPinnedPrivateChats((prev) =>
          prev.filter((chat) => chat.name !== chatName)
        );
      } else {
        // Pin chat (limit to 1 for private chats)
        if (pinnedPrivateChats.length >= 1) {
          showToast.warning(
            "You can only pin 1 private chat. Please unpin another private chat first."
          );
          return;
        }
        const chatInfo = {
          name: chatName,
          pinnedAt: Date.now(),
        };
        setPinnedPrivateChats((prev) => [chatInfo, ...prev]);
      }
    } else if (chatType === "group") {
      // Handle group chat pinning
      const isPinned = pinnedGroupChats.some((chat) => chat.name === chatName);

      if (isPinned) {
        // Unpin chat
        setPinnedGroupChats((prev) =>
          prev.filter((chat) => chat.name !== chatName)
        );
      } else {
        // Pin chat (limit to 1 for group chats)
        if (pinnedGroupChats.length >= 1) {
          showToast.warning(
            "You can only pin 1 group chat. Please unpin another group chat first."
          );
          return;
        }
        const chatInfo = {
          name: chatName,
          pinnedAt: Date.now(),
        };
        setPinnedGroupChats((prev) => [chatInfo, ...prev]);
      }
    }
  };

  const isChatPinned = (chatType, chatName) => {
    if (chatType === "user") {
      return pinnedPrivateChats.some((chat) => chat.name === chatName);
    } else if (chatType === "group") {
      return pinnedGroupChats.some((chat) => chat.name === chatName);
    }
    return false;
  };

  // Close sidebar when selecting a chat (mobile)
  const handleChatSelection = (chatType, value) => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }

    // Stop typing when switching chats
    if (selectedGroup) {
      socket.emit("stop_typing", { group: selectedGroup, username });
    } else if (selectedUser) {
      socket.emit("stop_typing", { to: selectedUser, username });
    }

    if (chatType === "public") {
      setSelectedUserWithPersistence(null);
      setSelectedGroupWithPersistence(null);
    } else if (chatType === "user") {
      setSelectedUserWithPersistence(value);
      setSelectedGroupWithPersistence(null);

      // Mark all messages as seen when switching to a private chat
      if (privateChats[value]) {
        const unreadMessages = privateChats[value].filter(
          (msg) =>
            msg._id &&
            msg.sender !== username &&
            !(msg.seenBy || []).includes(username)
        );

        unreadMessages.forEach((msg) => {
          setTimeout(() => {
            socket.emit("message_seen", { messageId: msg._id, username });
          }, 100);
        });
      }
    } else if (chatType === "group") {
      setSelectedGroupWithPersistence(value);
      setSelectedUserWithPersistence(null);
      setSelectedGroupMembers(
        groups.find((g) => g.name === value)?.members || []
      );
    }
  };

  const toggleTemporaryMessage = () => {
    setShowTemporaryMessageOptions(!showTemporaryMessageOptions);
  };

  const selectTemporaryDuration = (duration) => {
    setTemporaryMessageDuration(duration);
    setIsTemporaryMessage(true);
    setShowTemporaryMessageOptions(false);
  };

  // Update current time every second for countdown and handle client-side expiration
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check for expired temporary messages and mark them as expired immediately
      const checkExpiredMessages = () => {
        // Check public messages
        setChatLog((prev) =>
          prev.map((msg) => {
            if (
              msg.isTemporary &&
              msg.expiresAt &&
              new Date(msg.expiresAt) <= now &&
              !msg.expired
            ) {
              return { ...msg, expired: true, deleted: true };
            }
            return msg;
          })
        );

        // Check private messages
        setPrivateChats((prev) => {
          const updated = {};
          for (const key in prev) {
            updated[key] = prev[key].map((msg) => {
              if (
                msg.isTemporary &&
                msg.expiresAt &&
                new Date(msg.expiresAt) <= now &&
                !msg.expired
              ) {
                return { ...msg, expired: true, deleted: true };
              }
              return msg;
            });
          }
          return updated;
        });

        // Check group messages
        setGroupChats((prev) => {
          const updated = {};
          for (const group in prev) {
            updated[group] = prev[group].map((msg) => {
              if (
                msg.isTemporary &&
                msg.expiresAt &&
                new Date(msg.expiresAt) <= now &&
                !msg.expired
              ) {
                return { ...msg, expired: true, deleted: true };
              }
              return msg;
            });
          }
          return updated;
        });
      };

      checkExpiredMessages();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Media viewer state
  const [mediaViewer, setMediaViewer] = useState({
    open: false,
    mediaUrl: null,
    mediaType: null,
    sender: null,
    timestamp: null,
  });

  // Handle media click to open viewer
  const handleMediaClick = (mediaUrl, mediaType, sender, timestamp) => {
    setMediaViewer({
      open: true,
      mediaUrl,
      mediaType,
      sender,
      timestamp,
    });
  };

  // Handle view-once image click
  const handleViewOnceClick = (
    messageId,
    mediaUrl,
    mediaType,
    sender,
    timestamp
  ) => {
    // Emit view-once event to server
    socket.emit("view_once_image", { messageId, username });

    // Open media viewer
    setMediaViewer({
      open: true,
      mediaUrl,
      mediaType,
      sender,
      timestamp,
    });
  };

  // Close media viewer
  const closeMediaViewer = () => {
    setMediaViewer({
      open: false,
      mediaUrl: null,
      mediaType: null,
      sender: null,
      timestamp: null,
    });
  };

  // Handle escape key to close media viewer
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && mediaViewer.open) {
        closeMediaViewer();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mediaViewer.open]);

  //return the chat room ui
  return (

    <div className="wa-container">

      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className={`hamburger-menu ${sidebarOpen ? "active" : ""}`}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-chat-info">
          <div style={{ display: "flex", alignItems: "center" }}>
            {selectedUser &&
              renderAvatar(getAvatarUrl(selectedUser), selectedUser, 32, {
                marginRight: 8,
                border: "2px solid #4a90e2",
              })}
            {selectedGroup &&
              renderGroupAvatar(
                groups.find((g) => g.name === selectedGroup)?.avatarUrl,
                selectedGroup,
                32,
                { marginRight: 8, border: "2px solid #4a90e2" }
              )}
            <div>
              {selectedGroup ? (
                <>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    #{selectedGroup}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {selectedGroupMembers.length} members
                  </div>
                </>
              ) : selectedUser ? (
                <>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    {selectedUser}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: onlineUsers.includes(selectedUser)
                        ? "#25d366"
                        : "#999",
                    }}
                  >
                    {onlineUsers.includes(selectedUser) ? "Online" : "Offline"}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#333",
                  }}
                >
                  🗨️ Public Chat
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mobile-header-actions">
          <button
            onClick={openBackgroundSelector}
            className="mobile-background-btn"
            title="Change chat background"
          >
            <FaImage size={16} />
          </button>
          {selectedGroup && (
            <button
              onClick={() => setShowPinnedModal(true)}
              className="mobile-pin-button"
              title="View pinned messages"
            >
              <FaThumbtack size={16} />
              <span className="mobile-pin-count">
                {groupChats[selectedGroup]?.filter((m) => m.pinned).length || 0}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div
        className={`wa-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* sidebar */}
      <div className={`wa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar
          username={username}
          avatarUrl={avatarUrl}
          bio={bio}
          search={search}
          setSearch={setSearch}
          showPrivateChats={showPrivateChats}
          setShowPrivateChats={setShowPrivateChats}
          showGroups={showGroups}
          setShowGroups={setShowGroups}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          users={users}
          groups={groups}
          pinnedPrivateChats={pinnedPrivateChats}
          pinnedGroupChats={pinnedGroupChats}
          filteredUsers={filteredUsers}
          filteredGroups={filteredGroups}
          isChatPinned={isChatPinned}
          handleChatSelection={handleChatSelection}
          handlePinChat={handlePinChat}
          openGroupEditModal={openGroupEditModal}
          setShowGroupForm={setShowGroupForm}
          showGroupForm={showGroupForm}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          newGroupMembers={newGroupMembers}
          setNewGroupMembers={setNewGroupMembers}
          handleCreateGroup={handleCreateGroup}
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          handleAvatarChange={handleAvatarChange}
          openBioEditModal={openBioEditModal}
          getAvatarUrl={getAvatarUrl}
        />
      </div>

      {/* Chat Box */}
      <div className="wa-chat">
        <div className="wa-chat-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            {selectedUser &&
              renderAvatar(getAvatarUrl(selectedUser), selectedUser, 36, {
                marginRight: 10,
                border: "2px solid #4a90e2",
              })}
            <div>
              {selectedGroup ? (
                <>
                  <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {renderGroupAvatar(
                      groups.find((g) => g.name === selectedGroup)?.avatarUrl,
                      selectedGroup,
                      36,
                      { marginRight: 10, border: "2px solid #4a90e2" }
                    )}
                    <span>Group: #{selectedGroup}</span>
                  </div>
                  <div className="group-members">
                    Members: {selectedGroupMembers.join(", ")}
                  </div>
                </>
              ) : selectedUser ? (
                <>
                  <div style={{ fontWeight: "bold" }}>{selectedUser}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: onlineUsers.includes(selectedUser)
                        ? "#25d366"
                        : "#999",
                    }}
                  >
                    {onlineUsers.includes(selectedUser) ? "Online" : "Offline"}
                  </div>
                  {/* Show selected user's bio only in private chat header */}
                  {getBio(selectedUser) && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      {getBio(selectedUser)}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontWeight: "bold" }}>🗨️ Public Chat Room</div>
              )}
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              onClick={openBackgroundSelector}
              className="background-selector-btn"
              title="Change chat background"
            >
              <FaImage />
            </button>
            {selectedGroup && (
              <button
                onClick={() => setShowPinnedModal(true)}
                className="navbar-pin-button"
                title="View all pinned messages"
              >
                <FaThumbtack />
                <span className="pin-count">
                  {groupChats[selectedGroup]?.filter((m) => m.pinned).length || 0}
                </span>
              </button>
            )}
          </div>
        </div>
        <div 
          className="chat-box" 
          ref={chatBoxRef} 
          onScroll={handleScroll}
          style={getChatBackgroundStyle()}
        >
          {(selectedGroup
            ? groupChats[selectedGroup] || []
            : selectedUser
            ? privateChats[selectedUser] || []
            : chatLog
          ).map((msg, index) => (
            <MessageBubble
              key={msg._id || index}
              msg={msg}
              username={username}
              selectedGroup={selectedGroup}
              selectedUser={selectedUser}
              groups={groups}
              polls={polls}
              currentTime={currentTime}
              getAvatarUrl={getAvatarUrl}
              findMessageById={findMessageById}
              handleReaction={handleReaction}
              handleEditMessage={handleEditMessage}
              handlePinMessage={handlePinMessage}
              handleViewOnceClick={handleViewOnceClick}
              handleMediaClick={handleMediaClick}
              handleVotePoll={handleVotePoll}
              handleClosePoll={handleClosePoll}
              setReplyTo={setReplyTo}
              setForwardModal={setForwardModal}
              socket={socket}
              reactionBox={reactionBox}
              setReactionBox={setReactionBox}
              editModal={editModal}
              REACTION_EMOJIS={REACTION_EMOJIS}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            className="scroll-to-bottom-btn"
            onClick={() => {
              scrollToBottom(true); // Smooth scroll when button is clicked
              setShowScrollButton(false);
            }}
            title="Scroll to bottom"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
            </svg>
          </button>
        )}

        {/* Typing indicator above input box */}
        {(selectedUser || selectedGroup) && typingUsers.length > 0 && (
          <div className="typing-indicator-above">
            <div className="typing-avatar">
              {selectedUser &&
                renderAvatar(getAvatarUrl(typingUsers[0]), typingUsers[0], 24, {
                  border: "1.5px solid #4a90e2",
                })}
            </div>
            <div className="typing-content">
              <div className="typing-text">
                {selectedGroup
                  ? `${typingUsers.join(", ")} typing...`
                  : `${typingUsers[0]} typing...`}
              </div>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Media preview above input - WhatsApp style */}
        {mediaPreview && (
          <div className="wa-media-preview">
            <div className="wa-media-preview-content">
              {media && media.type.startsWith("image") ? (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="wa-media-preview-img"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="wa-media-preview-video"
                />
              )}
            </div>
            <button
              onClick={() => {
                setMedia(null);
                setMediaPreview(null);
              }}
              className="wa-media-remove"
              title="Remove media"
            >
              ×
            </button>
          </div>
        )}

        <div className="input-box">
          <ChatInput
            message={message}
            sendMessage={sendMessage}
            selectedGroup={selectedGroup}
            media={media}
            handleMediaChange={handleMediaChange}
            showEmoji={showEmoji}
            setShowEmoji={setShowEmoji}
            handleEmojiSelect={handleEmojiSelect}
            setShowCreatePollModal={setShowCreatePollModal}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            mentionSuggestions={mentionSuggestions}
            showMentionSuggestions={showMentionSuggestions}
            selectedMentionIndex={selectedMentionIndex}
            setSelectedMentionIndex={setSelectedMentionIndex}
            insertMention={insertMention}
            handleInputChange={handleInputChange}
            isTemporaryMessage={isTemporaryMessage}
            isViewOnce={isViewOnce}
            setIsViewOnce={setIsViewOnce}
            showTemporaryMessageOptions={showTemporaryMessageOptions}
            toggleTemporaryMessage={toggleTemporaryMessage}
            selectTemporaryDuration={selectTemporaryDuration}
            temporaryMessageDuration={temporaryMessageDuration}
            setShowScheduleModal={setShowScheduleModal}
            isScheduled={isScheduled}
            scheduledDateTime={scheduledDateTime}
            setShowMentionSuggestions={setShowMentionSuggestions}
            setMentionSuggestions={setMentionSuggestions}
          />
        </div>
      </div>

      {/* All Modals */}
      <Modals
        forwardModal={forwardModal}
        setForwardModal={setForwardModal}
        forwardTarget={forwardTarget}
        setForwardTarget={setForwardTarget}
        handleForwardSelect={handleForwardSelect}
        users={users}
        groups={groups}
        username={username}
        editModal={editModal}
        editMessageText={editMessageText}
        setEditMessageText={setEditMessageText}
        saveEditedMessage={saveEditedMessage}
        cancelEdit={cancelEdit}
        bioEditModal={bioEditModal}
        setBioEditModal={setBioEditModal}
        handleBioSave={handleBioSave}
        cancelBioEdit={cancelBioEdit}
        groupEditModal={groupEditModal}
        setGroupEditModal={setGroupEditModal}
        handleGroupAvatarFileSelect={handleGroupAvatarFileSelect}
        handleGroupAvatarEditorSave={handleGroupAvatarEditorSave}
        handleGroupAvatarEditorCancel={handleGroupAvatarEditorCancel}
        saveGroupChanges={saveGroupChanges}
        cancelGroupEdit={cancelGroupEdit}
        removeSelectedAvatar={removeSelectedAvatar}
        toggleMemberSelector={toggleMemberSelector}
        addMember={addMember}
        removeMember={removeMember}
        handleDeleteGroup={handleDeleteGroup}
        handleLeaveGroup={handleLeaveGroup}
        handleAddAdmin={handleAddAdmin}
        handleRemoveAdmin={handleRemoveAdmin}
        toggleAdminSelector={toggleAdminSelector}
        isUserAdminOrCreator={isUserAdminOrCreator}
        isUserCreator={isUserCreator}
        showPinnedModal={showPinnedModal}
        setShowPinnedModal={setShowPinnedModal}
        selectedGroup={selectedGroup}
        groupChats={groupChats}
        handlePinMessage={handlePinMessage}
        mediaViewer={mediaViewer}
        closeMediaViewer={closeMediaViewer}
        showScheduleModal={showScheduleModal}
        setShowScheduleModal={setShowScheduleModal}
        scheduledDateTime={scheduledDateTime}
        setScheduledDateTime={setScheduledDateTime}
        setIsScheduled={setIsScheduled}
        showCreatePollModal={showCreatePollModal}
        setShowCreatePollModal={setShowCreatePollModal}
        handleCreatePoll={handleCreatePoll}
        editSuccess={editSuccess}
        renderGroupAvatar={renderGroupAvatar}
        sendMessage={sendMessage}
      />

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={showCreatePollModal}
        onClose={() => setShowCreatePollModal(false)}
        onCreatePoll={handleCreatePoll}
        groupName={selectedGroup}
      />

      {/* Avatar Editor */}
      <AvatarEditor
        isOpen={avatarEditor.isOpen}
        imageFile={avatarEditor.imageFile}
        type={avatarEditor.type}
        username={username}
        groupName={avatarEditor.groupName}
        key={avatarEditor.key}
        onSave={avatarEditor.type === 'user' ? handleAvatarEditorSave : handleGroupAvatarEditorSave}
        onCancel={avatarEditor.type === 'user' ? handleAvatarEditorCancel : handleGroupAvatarEditorCancel}
      />

      {/* Background Selector */}
      <BackgroundSelector
        isOpen={backgroundSelector.isOpen}
        onClose={closeBackgroundSelector}
        onSelectBackground={handleBackgroundSelect}
        currentBackground={chatBackground}
        currentChatType={selectedGroup ? 'group' : 'user'}
        currentChatName={selectedGroup || selectedUser}
      />
      
    </div>

  );

};

export default ChatRoom;
