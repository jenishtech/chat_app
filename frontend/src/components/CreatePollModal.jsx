import React, { useState } from 'react';
import { FaPoll, FaPlus, FaTrash, FaClock, FaCheckSquare } from 'react-icons/fa';
import './CreatePollModal.css';

const CreatePollModal = ({ isOpen, onClose, onCreatePoll, groupName }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [expiryEnabled, setExpiryEnabled] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      return;
    }
    
    const validOptions = options.filter(option => option.trim());
    if (validOptions.length < 2) {
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions,
      group: groupName,
      allowMultipleVotes,
      expiresAt: expiryEnabled && expiresAt ? new Date(expiresAt).toISOString() : null
    };

    onCreatePoll(pollData);
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setAllowMultipleVotes(false);
    setExpiresAt('');
    setExpiryEnabled(false);
    onClose();
  };

  const handleClose = () => {
    setQuestion('');
    setOptions(['', '']);
    setAllowMultipleVotes(false);
    setExpiresAt('');
    setExpiryEnabled(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="poll-modal-backdrop">
      <div className="poll-modal">
        <div className="poll-modal-header">
          <div className="poll-modal-title">
            <FaPoll className="poll-modal-icon" />
            <span>Create Poll</span>
          </div>
          <button className="poll-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="poll-modal-form">
          <div className="poll-form-group">
            <label htmlFor="poll-question">Question *</label>
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              required
              maxLength={200}
            />
          </div>

          <div className="poll-form-group">
            <label>Options * (minimum 2)</label>
            {options.map((option, index) => (
              <div key={index} className="poll-option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="poll-remove-option"
                    onClick={() => removeOption(index)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <button
                type="button"
                className="poll-add-option"
                onClick={addOption}
              >
                <FaPlus /> Add Option
              </button>
            )}
          </div>

          <div className="poll-form-group">
            <label className="poll-checkbox-label">
              <input
                type="checkbox"
                checked={allowMultipleVotes}
                onChange={(e) => setAllowMultipleVotes(e.target.checked)}
              />
              <FaCheckSquare className="poll-checkbox-icon" />
              Allow multiple votes
            </label>
          </div>

          <div className="poll-form-group">
            <label className="poll-checkbox-label">
              <input
                type="checkbox"
                checked={expiryEnabled}
                onChange={(e) => setExpiryEnabled(e.target.checked)}
              />
              <FaClock className="poll-checkbox-icon" />
              Set expired date
            </label>
            {expiryEnabled && (
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>

          <div className="poll-modal-actions">
            <button type="button" className="poll-modal-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="poll-modal-create">
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal; 