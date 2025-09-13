import React, { useState, useEffect } from 'react';
import { FaTimes, FaPalette, FaShapes, FaSquare, FaGlobe, FaUser, FaPlus, FaEyeDropper, FaMagic } from 'react-icons/fa';
import './BackgroundSelector.css';

const API = import.meta.env.VITE_API_URL;

const BackgroundSelector = ({ isOpen, onClose, onSelectBackground, currentBackground, currentChatType, currentChatName }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('gradients');
  const [applyTo, setApplyTo] = useState('current'); // 'current' or 'all'
  const [showColorCreator, setShowColorCreator] = useState(false);
  const [customGradient, setCustomGradient] = useState({
    color1: '#4a90e2',
    color2: '#2563eb',
    direction: 'to bottom right',
    pattern: 'none'
  });

  useEffect(() => {
    if (isOpen) {
      loadBackgrounds();
    }
  }, [isOpen]);

  const loadBackgrounds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/backgrounds/list`);
      const data = await response.json();
      // Only show built-in backgrounds, filter out custom ones
      const builtInBackgrounds = data.backgrounds.filter(bg => bg.type === 'built-in');
      setBackgrounds(builtInBackgrounds);
    } catch (error) {
      console.error('Error loading backgrounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundSelect = (background) => {
    // Pass additional information about where to apply the background
    onSelectBackground(background, applyTo);
    onClose();
  };

  const handleCustomBackgroundSelect = () => {
    const customBackground = {
      id: `custom-${Date.now()}`,
      name: 'Custom Background',
      url: null,
      type: 'custom',
      customData: customGradient
    };
    onSelectBackground(customBackground, applyTo);
    onClose();
  };

  const getBackgroundStyle = (background) => {
    if (background.id === 'default') {
      return { background: '#f4f7fa' };
    }
    
    if (background.type === 'custom' && background.customData) {
      return generateCustomBackgroundStyle(background.customData);
    }
    
    if (background.url) {
      return {
        backgroundImage: `url(${background.url.startsWith('data:') ? background.url : API + background.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return { background: '#f4f7fa' };
  };

  const generateCustomBackgroundStyle = (customData) => {
    const { color1, color2, direction, pattern } = customData;
    
    if (pattern === 'none') {
      return {
        background: `linear-gradient(${direction}, ${color1}, ${color2})`
      };
    }
    
    if (pattern === 'radial') {
      return {
        background: `radial-gradient(circle, ${color1}, ${color2})`
      };
    }
    
    if (pattern === 'stripes') {
      return {
        background: `repeating-linear-gradient(45deg, ${color1}, ${color1} 10px, ${color2} 10px, ${color2} 20px)`
      };
    }
    
    if (pattern === 'dots') {
      return {
        background: `
          radial-gradient(circle at 25% 25%, ${color2} 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, ${color2} 2px, transparent 2px),
          ${color1}
        `,
        backgroundSize: '20px 20px, 20px 20px, 100% 100%'
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
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      };
    }
    
    return {
      background: `linear-gradient(${direction}, ${color1}, ${color2})`
    };
  };

  const categorizeBackgrounds = () => {
    const categories = {
      gradients: [],
      patterns: [],
      solid: []
    };

    backgrounds.forEach(bg => {
      if (bg.id === 'default') {
        categories.solid.unshift(bg); // Put default first in solid colors
      } else if (bg.id.startsWith('gradient-')) {
        categories.gradients.push(bg);
      } else if (bg.id.startsWith('pattern-')) {
        categories.patterns.push(bg);
      } else if (bg.id.startsWith('solid-')) {
        categories.solid.push(bg);
      }
    });

    return categories;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gradients':
        return <FaPalette />;
      case 'patterns':
        return <FaShapes />;
      case 'solid':
        return <FaSquare />;
      default:
        return <FaPalette />;
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'gradients':
        return 'Gradients';
      case 'patterns':
        return 'Patterns';
      case 'solid':
        return 'Solid Colors';
      default:
        return 'Backgrounds';
    }
  };

  const getCurrentChatDisplayName = () => {
    if (!currentChatType || !currentChatName) return 'this chat';
    
    if (currentChatType === 'group') {
      return `group "${currentChatName}"`;
    } else {
      return `chat with ${currentChatName}`;
    }
  };

  const categories = categorizeBackgrounds();

  if (!isOpen) return null;

  return (
    <div className="background-selector-backdrop" onClick={onClose}>
      <div className="background-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="background-selector-header">
          <h3>Chat Background</h3>
          <button className="background-selector-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="background-selector-content">
          {/* Apply To Options */}
          <div className="apply-to-section">
            <h4>Apply to:</h4>
            <div className="apply-to-options">
              <button
                className={`apply-to-option ${applyTo === 'current' ? 'active' : ''}`}
                onClick={() => setApplyTo('current')}
              >
                <FaUser />
                <div className="apply-to-text">
                  <span className="apply-to-title">This Chat</span>
                  <span className="apply-to-subtitle">{getCurrentChatDisplayName()}</span>
                </div>
              </button>
              <button
                className={`apply-to-option ${applyTo === 'all' ? 'active' : ''}`}
                onClick={() => setApplyTo('all')}
              >
                <FaGlobe />
                <div className="apply-to-text">
                  <span className="apply-to-title">All Chats</span>
                  <span className="apply-to-subtitle">Apply to all conversations</span>
                </div>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="background-categories">
            {Object.keys(categories).map((category) => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {getCategoryIcon(category)}
                <span>{getCategoryTitle(category)}</span>
                <span className="category-count">({categories[category].length})</span>
              </button>
            ))}
            <button
              className={`category-tab ${showColorCreator ? 'active' : ''}`}
              onClick={() => setShowColorCreator(!showColorCreator)}
            >
              <FaMagic />
              <span>Create</span>
              <span className="category-count">(Custom)</span>
            </button>
          </div>

          {/* Color Creator Section */}
          {showColorCreator && (
            <div className="color-creator-section">
              <h4>Create Custom Background</h4>
              <div className="color-creator-content">
                <div className="color-picker-section">
                  <div className="color-picker-group">
                    <label>Color 1:</label>
                    <input
                      type="color"
                      value={customGradient.color1}
                      onChange={(e) => setCustomGradient(prev => ({ ...prev, color1: e.target.value }))}
                      className="color-picker"
                    />
                    <span className="color-value">{customGradient.color1}</span>
                  </div>
                  <div className="color-picker-group">
                    <label>Color 2:</label>
                    <input
                      type="color"
                      value={customGradient.color2}
                      onChange={(e) => setCustomGradient(prev => ({ ...prev, color2: e.target.value }))}
                      className="color-picker"
                    />
                    <span className="color-value">{customGradient.color2}</span>
                  </div>
                </div>

                <div className="direction-selector">
                  <label>Direction:</label>
                  <select
                    value={customGradient.direction}
                    onChange={(e) => setCustomGradient(prev => ({ ...prev, direction: e.target.value }))}
                  >
                    <option value="to bottom right">Bottom Right</option>
                    <option value="to bottom left">Bottom Left</option>
                    <option value="to top right">Top Right</option>
                    <option value="to top left">Top Left</option>
                    <option value="to right">Right</option>
                    <option value="to left">Left</option>
                    <option value="to bottom">Bottom</option>
                    <option value="to top">Top</option>
                  </select>
                </div>

                <div className="pattern-selector">
                  <label>Pattern:</label>
                  <div className="pattern-options">
                    {['none', 'radial', 'stripes', 'dots', 'waves'].map((pattern) => (
                      <button
                        key={pattern}
                        className={`pattern-option ${customGradient.pattern === pattern ? 'active' : ''}`}
                        onClick={() => setCustomGradient(prev => ({ ...prev, pattern }))}
                      >
                        <div 
                          className="pattern-preview"
                          style={generateCustomBackgroundStyle({ ...customGradient, pattern })}
                        />
                        <span>{pattern.charAt(0).toUpperCase() + pattern.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="custom-preview">
                  <label>Preview:</label>
                  <div 
                    className="custom-background-preview"
                    style={generateCustomBackgroundStyle(customGradient)}
                  />
                </div>

                <button 
                  className="apply-custom-btn"
                  onClick={handleCustomBackgroundSelect}
                >
                  <FaPlus />
                  Apply Custom Background
                </button>
              </div>
            </div>
          )}

          {/* Backgrounds Grid */}
          {!showColorCreator && (
            <div className="backgrounds-section">
              {loading ? (
                <div className="backgrounds-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading backgrounds...</p>
                </div>
              ) : (
                <div className="backgrounds-grid">
                  {categories[activeCategory].map((background) => (
                    <div
                      key={background.id}
                      className={`background-item ${currentBackground?.id === background.id ? 'selected' : ''}`}
                      onClick={() => handleBackgroundSelect(background)}
                    >
                      <div 
                        className="background-preview-item"
                        style={getBackgroundStyle(background)}
                      >
                        {background.id === 'default' && (
                          <div className="background-default-label">Default</div>
                        )}
                        {currentBackground?.id === background.id && (
                          <div className="background-selected-indicator">
                            <div className="checkmark">✓</div>
                          </div>
                        )}
                      </div>
                      <div className="background-item-info">
                        <span className="background-name">{background.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSelector; 