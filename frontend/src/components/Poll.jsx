import React, { useState, useEffect } from 'react';
import { FaPoll, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import './Poll.css';

const Poll = ({ poll, onVote, onClose, currentUser, isCreator }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check if user has already voted
    const userVotes = poll.options.flatMap((option, index) => 
      option.votes.includes(currentUser) ? [index] : []
    );
    setSelectedOptions(userVotes);
    setHasVoted(userVotes.length > 0);
  }, [poll, currentUser]);

  // Timer to update current time for real-time expiration checking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const handleOptionClick = (optionIndex) => {
    if (!poll.isActive || (poll.expiresAt && currentTime > new Date(poll.expiresAt))) {
      return;
    }

    if (poll.allowMultipleVotes) {
      // Toggle selection for multiple votes
      setSelectedOptions(prev => {
        const newSelection = prev.includes(optionIndex)
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex];
        return newSelection;
      });
    } else {
      // Single selection
      setSelectedOptions([optionIndex]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;
    
    selectedOptions.forEach(optionIndex => {
      onVote(poll._id, optionIndex);
    });
  };

  const isExpired = poll.expiresAt && currentTime > new Date(poll.expiresAt);
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  // Calculate time remaining until expiry
  const getTimeRemaining = () => {
    if (!poll.expiresAt) return '';
    
    const timeDiff = new Date(poll.expiresAt) - currentTime;
    
    if (timeDiff <= 0) return 'Expired';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="poll-container">
      <div className="poll-header">
        {/* <FaPoll className="poll-icon" /> */}
        {/* <span className="poll-question">{poll.question}</span> */}
        {isExpired && <span className="poll-expired">Expired</span>}
        {!poll.isActive && <span className="poll-closed">Closed</span>}
      </div>

      <div className="poll-options">
        {poll.options.map((option, index) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = selectedOptions.includes(index);
          const hasUserVoted = option.votes.includes(currentUser);

          return (
            <div
              key={index}
              className={`poll-option ${isSelected ? 'selected' : ''} ${hasUserVoted ? 'voted' : ''}`}
              onClick={() => handleOptionClick(index)}
            >
              <div className="poll-option-content">
                <div className="poll-option-text">{option.text}</div>
                <div className="poll-option-stats">
                  <span className="poll-vote-count">{voteCount} votes</span>
                  <span className="poll-percentage">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="poll-progress-bar">
                <div 
                  className="poll-progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              {hasUserVoted && <FaCheck className="poll-vote-indicator" />}
            </div>
          );
        })}
      </div>

      <div className="poll-footer">
        <div className="poll-info">
          <span className="poll-total-votes">Total: {totalVotes} votes</span>
          {poll.allowMultipleVotes && <span className="poll-multiple">Multiple votes allowed</span>}
          {poll.expiresAt && (
            <span className="poll-expiry">
              <FaClock /> {getTimeRemaining()}
            </span>
          )}
        </div>

        {poll.isActive && !isExpired && (
          <div className="poll-actions">
            {!hasVoted && selectedOptions.length > 0 && (
              <button 
                className="poll-vote-btn"
                onClick={handleVote}
              >
                Vote
              </button>
            )}
            {isCreator && (
              <button 
                className="poll-close-btn"
                onClick={() => onClose(poll._id)}
              >
                <FaTimes /> Close Poll
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Poll; 