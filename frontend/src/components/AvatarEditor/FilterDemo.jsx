import React, { useState } from 'react';
import './FilterDemo.css';

// Sample filter presets for demo
const DEMO_FILTERS = {
  none: { name: 'Original', filter: 'none' },
  sepia: { name: 'Sepia', filter: 'sepia(0.8)' },
  grayscale: { name: 'Grayscale', filter: 'grayscale(1)' },
  vintage: { name: 'Vintage', filter: 'sepia(0.5) contrast(1.2) brightness(0.9)' },
  warm: { name: 'Warm', filter: 'sepia(0.3) saturate(1.3) hue-rotate(-10deg)' },
  cool: { name: 'Cool', filter: 'saturate(1.2) hue-rotate(180deg) brightness(1.1)' },
  dramatic: { name: 'Dramatic', filter: 'contrast(1.4) saturate(1.2) brightness(0.9)' },
  bright: { name: 'Bright', filter: 'brightness(1.3) contrast(1.1) saturate(1.2)' },
  soft: { name: 'Soft', filter: 'brightness(1.1) contrast(0.9) saturate(0.8)' },
  sharp: { name: 'Sharp', filter: 'contrast(1.3) saturate(1.1) brightness(1.05)' },
  noir: { name: 'Noir', filter: 'grayscale(1) contrast(1.4) brightness(0.8)' },
  sunset: { name: 'Sunset', filter: 'sepia(0.4) saturate(1.4) hue-rotate(-30deg) brightness(1.1)' },
  ocean: { name: 'Ocean', filter: 'saturate(1.3) hue-rotate(200deg) brightness(1.05)' },
  forest: { name: 'Forest', filter: 'saturate(1.2) hue-rotate(120deg) contrast(1.1)' },
  rose: { name: 'Rose', filter: 'saturate(1.4) hue-rotate(340deg) brightness(1.05)' },
  golden: { name: 'Golden', filter: 'sepia(0.6) saturate(1.3) hue-rotate(30deg) brightness(1.1)' }
};

const FilterDemo = () => {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [manualAdjustments, setManualAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0
  });

  const getCombinedFilterStyle = () => {
    const preset = DEMO_FILTERS[selectedFilter];
    const adjustments = manualAdjustments;
    
    let filterString = '';
    
    // Add preset filter
    if (preset && preset.filter !== 'none') {
      filterString += preset.filter + ' ';
    }
    
    // Add manual adjustments
    if (adjustments.brightness !== 100) {
      filterString += `brightness(${adjustments.brightness}%) `;
    }
    if (adjustments.contrast !== 100) {
      filterString += `contrast(${adjustments.contrast}%) `;
    }
    if (adjustments.saturation !== 100) {
      filterString += `saturate(${adjustments.saturation}%) `;
    }
    if (adjustments.hue !== 0) {
      filterString += `hue-rotate(${adjustments.hue}deg) `;
    }
    if (adjustments.blur > 0) {
      filterString += `blur(${adjustments.blur}px) `;
    }
    
    return filterString.trim();
  };

  return (
    <div className="filter-demo">
      <div className="demo-header">
        <h2>Avatar Editor Filter Demo</h2>
        <p>Explore the comprehensive filter system with live preview</p>
      </div>

      <div className="demo-content">
        <div className="demo-image-section">
          <div className="demo-image-container">
            <img
              src="https://via.placeholder.com/300x300/4a90e2/ffffff?text=Sample+Avatar"
              alt="Demo avatar"
              className="demo-image"
              style={{ filter: getCombinedFilterStyle() }}
            />
          </div>
          <div className="current-filter-info">
            <h3>Current Filter: {DEMO_FILTERS[selectedFilter].name}</h3>
            <code className="filter-code">{getCombinedFilterStyle() || 'none'}</code>
          </div>
        </div>

        <div className="demo-controls">
          <div className="control-section">
            <h3>Filter Presets</h3>
            <div className="filter-grid">
              {Object.entries(DEMO_FILTERS).map(([key, filter]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key)}
                  className={`filter-option ${selectedFilter === key ? 'active' : ''}`}
                >
                  <div 
                    className="filter-preview"
                    style={{ filter: filter.filter }}
                  >
                    <div className="preview-inner"></div>
                  </div>
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3>Manual Adjustments</h3>
            <div className="adjustment-controls">
              <div className="adjustment-slider">
                <label>Brightness: {manualAdjustments.brightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={manualAdjustments.brightness}
                  onChange={(e) => setManualAdjustments(prev => ({
                    ...prev,
                    brightness: parseInt(e.target.value)
                  }))}
                />
              </div>
              
              <div className="adjustment-slider">
                <label>Contrast: {manualAdjustments.contrast}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={manualAdjustments.contrast}
                  onChange={(e) => setManualAdjustments(prev => ({
                    ...prev,
                    contrast: parseInt(e.target.value)
                  }))}
                />
              </div>
              
              <div className="adjustment-slider">
                <label>Saturation: {manualAdjustments.saturation}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={manualAdjustments.saturation}
                  onChange={(e) => setManualAdjustments(prev => ({
                    ...prev,
                    saturation: parseInt(e.target.value)
                  }))}
                />
              </div>
              
              <div className="adjustment-slider">
                <label>Hue: {manualAdjustments.hue}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={manualAdjustments.hue}
                  onChange={(e) => setManualAdjustments(prev => ({
                    ...prev,
                    hue: parseInt(e.target.value)
                  }))}
                />
              </div>
              
              <div className="adjustment-slider">
                <label>Blur: {manualAdjustments.blur}px</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={manualAdjustments.blur}
                  onChange={(e) => setManualAdjustments(prev => ({
                    ...prev,
                    blur: parseFloat(e.target.value)
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Reset Controls</h3>
            <button 
              className="reset-btn"
              onClick={() => {
                setSelectedFilter('none');
                setManualAdjustments({
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  hue: 0,
                  blur: 0
                });
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      <div className="demo-footer">
        <h3>Features Demonstrated</h3>
        <ul>
          <li>✅ 15+ Instagram-like filter presets</li>
          <li>✅ Real-time filter preview</li>
          <li>✅ Manual adjustment sliders</li>
          <li>✅ Combined filter effects</li>
          <li>✅ Live CSS filter application</li>
          <li>✅ Responsive design</li>
        </ul>
      </div>
    </div>
  );
};

export default FilterDemo; 