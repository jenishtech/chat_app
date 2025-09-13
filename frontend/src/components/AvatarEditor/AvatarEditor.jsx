import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './AvatarEditor.css';

// Predefined filter presets
const FILTER_PRESETS = {
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

// Font style options
const FONT_STYLES = [
  { name: 'Default', value: 'Arial, sans-serif' },
  { name: 'Bold', value: 'Arial Black, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Monospace', value: 'Courier New, monospace' },
  { name: 'Cursive', value: 'Brush Script MT, cursive' },
  { name: 'Modern', value: 'Segoe UI, sans-serif' },
  { name: 'Playful', value: 'Comic Sans MS, cursive' },
  { name: 'Elegant', value: 'Times New Roman, serif' }
];

// Predefined color schemes for auto-generated avatars
const COLOR_SCHEMES = [
  { name: 'Blue', bg: '#4a90e2', text: '#ffffff' },
  { name: 'Green', bg: '#50c878', text: '#ffffff' },
  { name: 'Purple', bg: '#9b59b6', text: '#ffffff' },
  { name: 'Orange', bg: '#f39c12', text: '#ffffff' },
  { name: 'Red', bg: '#e74c3c', text: '#ffffff' },
  { name: 'Teal', bg: '#1abc9c', text: '#ffffff' },
  { name: 'Pink', bg: '#e91e63', text: '#ffffff' },
  { name: 'Yellow', bg: '#f1c40f', text: '#333333' },
  { name: 'Gray', bg: '#95a5a6', text: '#ffffff' },
  { name: 'Dark', bg: '#2c3e50', text: '#ffffff' },
  { name: 'Light Blue', bg: '#3498db', text: '#ffffff' },
  { name: 'Lime', bg: '#2ecc71', text: '#ffffff' }
];

const AvatarEditor = ({ 
  imageFile, 
  onSave, 
  onCancel, 
  isOpen, 
  type = 'user', // 'user' or 'group'
  username = '', // Add username prop for auto-generated avatars
  groupName = '', // Add groupName prop for group avatars
  key = null // Add key prop to force re-render
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [imageSrc, setImageSrc] = useState('');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [aspectRatio] = useState(1);
  
  // Filter states
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [manualAdjustments, setManualAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sharpness: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  
  // Auto-generated avatar states
  const [autoAvatarSettings, setAutoAvatarSettings] = useState({
    backgroundColor: '#4a90e2',
    textColor: '#ffffff',
    fontStyle: 'Arial, sans-serif',
    useAutoGenerate: false
  });
  const [selectedColorScheme, setSelectedColorScheme] = useState('Blue');
  
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Load image when file changes or key changes
  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        // Reset transformations
        setCrop({
          unit: '%',
          width: 90,
          height: 90,
          x: 5,
          y: 5
        });
        setScale(1);
        setRotation(0);
        setFlip({ horizontal: false, vertical: false });
        setSelectedFilter('none');
        setManualAdjustments({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          hue: 0,
          blur: 0,
          sharpness: 0
        });
        setAutoAvatarSettings(prev => ({ ...prev, useAutoGenerate: false }));
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, key]); // Add key to dependencies



  // Handle crop change
  const onCropChange = useCallback((newCrop) => {
    setCrop(newCrop);
  }, []);

  // Handle image load
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const cropWidth = (width * 90) / 100;
    const cropHeight = (height * 90) / 100;
    
    setCrop({
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2
    });
  }, []);

  // Flip image horizontally
  const flipHorizontal = () => {
    setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }));
  };

  // Flip image vertically
  const flipVertical = () => {
    setFlip(prev => ({ ...prev, vertical: !prev.vertical }));
  };

  // Rotate image
  const rotateImage = (direction) => {
    setRotation(prev => {
      const newRotation = direction === 'left' ? prev - 90 : prev + 90;
      return newRotation % 360;
    });
  };

  // Reset all transformations
  const resetTransformations = () => {
    setScale(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setSelectedFilter('none');
    setManualAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sharpness: 0
    });
    setAutoAvatarSettings(prev => ({ ...prev, useAutoGenerate: false }));
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const cropWidth = (width * 90) / 100;
      const cropHeight = (height * 90) / 100;
      
      setCrop({
        unit: 'px',
        width: cropWidth,
        height: cropHeight,
        x: (width - cropWidth) / 2,
        y: (height - cropHeight) / 2
      });
    }
  };



  // Apply color scheme
  const applyColorScheme = (schemeName) => {
    const scheme = COLOR_SCHEMES.find(s => s.name === schemeName);
    if (scheme) {
      setAutoAvatarSettings(prev => ({
        ...prev,
        backgroundColor: scheme.bg,
        textColor: scheme.text
      }));
      setSelectedColorScheme(schemeName);
    }
  };



  // Get combined filter style
  const getCombinedFilterStyle = () => {
    const preset = FILTER_PRESETS[selectedFilter];
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

  // Get transformed image style
  const getImageStyle = () => {
    const style = {
      transform: `scale(${scale}) rotate(${rotation}deg) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`,
      filter: getCombinedFilterStyle(),
      transition: 'transform 0.3s ease, filter 0.3s ease'
    };
    return style;
  };

  // Process and save the edited image
  const handleSave = async () => {
    if (autoAvatarSettings.useAutoGenerate) {
      // Generate auto avatar
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to final avatar size (200x200 for good quality)
      const avatarSize = 200;
      canvas.width = avatarSize;
      canvas.height = avatarSize;

      // Clear canvas
      ctx.clearRect(0, 0, avatarSize, avatarSize);

      // Fill background
      ctx.fillStyle = autoAvatarSettings.backgroundColor;
      ctx.fillRect(0, 0, avatarSize, avatarSize);

      // Draw text
      const firstChar = type === 'group' ? groupName.charAt(0).toUpperCase() : username.charAt(0).toUpperCase();
      ctx.fillStyle = autoAvatarSettings.textColor;
      ctx.font = `bold ${avatarSize * 0.6}px ${autoAvatarSettings.fontStyle}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(firstChar, avatarSize / 2, avatarSize / 2);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a new file with the generated avatar
          const generatedFile = new File([blob], 'avatar.png', {
            type: 'image/png',
            lastModified: Date.now()
          });
          onSave(generatedFile);
        }
      }, 'image/png', 0.9);
    } else if (imgRef.current && canvasRef.current) {
      // Process uploaded image
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = imgRef.current;

      // Set canvas size to final avatar size (200x200 for good quality)
      const avatarSize = 200;
      canvas.width = avatarSize;
      canvas.height = avatarSize;

      // Clear canvas
      ctx.clearRect(0, 0, avatarSize, avatarSize);

      // Calculate crop dimensions
      const cropX = crop.x;
      const cropY = crop.y;
      const cropWidth = crop.width;
      const cropHeight = crop.height;

      // Create a temporary canvas for transformations
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Set temp canvas size to accommodate transformations
      const maxDimension = Math.max(image.naturalWidth, image.naturalHeight) * scale;
      tempCanvas.width = maxDimension;
      tempCanvas.height = maxDimension;

      // Apply transformations to temp canvas
      tempCtx.save();
      tempCtx.translate(maxDimension / 2, maxDimension / 2);
      tempCtx.scale(scale, scale);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
      tempCtx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
        image.naturalWidth,
        image.naturalHeight
      );
      tempCtx.restore();

      // Apply filters to temp canvas
      const filterStyle = getCombinedFilterStyle();
      if (filterStyle) {
        tempCanvas.style.filter = filterStyle;
        // Create a new canvas to apply the filter
        const filterCanvas = document.createElement('canvas');
        const filterCtx = filterCanvas.getContext('2d');
        filterCanvas.width = tempCanvas.width;
        filterCanvas.height = tempCanvas.height;
        
        // Apply the filter by drawing the temp canvas onto the filter canvas
        filterCtx.filter = filterStyle;
        filterCtx.drawImage(tempCanvas, 0, 0);
        
        // Use the filtered canvas for final drawing
        ctx.drawImage(
          filterCanvas,
          cropX * scale,
          cropY * scale,
          cropWidth * scale,
          cropHeight * scale,
          0,
          0,
          avatarSize,
          avatarSize
        );
      } else {
        // Draw the cropped and transformed image to final canvas
        ctx.drawImage(
          tempCanvas,
          cropX * scale,
          cropY * scale,
          cropWidth * scale,
          cropHeight * scale,
          0,
          0,
          avatarSize,
          avatarSize
        );
      }

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a new file with the edited image
          const editedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now()
          });
          onSave(editedFile);
        }
      }, imageFile.type, 0.9);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="avatar-editor-overlay">
      <div className="avatar-editor-modal">
        {/* Header Section */}
        <div className="avatar-editor-header">
          <div className="header-content">
            <div className="header-icon">🎨</div>
            <div className="header-text">
              <h3>Avatar Editor</h3>
              <p>Create your perfect {type === 'user' ? 'profile' : 'group'} avatar</p>
            </div>
          </div>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="avatar-editor-content">
          {/* Main Preview Section */}
          <div className="preview-section">
            <div className="preview-container">
              {autoAvatarSettings.useAutoGenerate ? (
                // Auto-generated avatar preview
                <div className="auto-avatar-preview">
                  <div 
                    className="auto-avatar-display"
                    style={{
                      backgroundColor: autoAvatarSettings.backgroundColor,
                      color: autoAvatarSettings.textColor,
                      fontFamily: autoAvatarSettings.fontStyle,
                      fontSize: '120px',
                      fontWeight: 'bold',
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {type === 'group' ? groupName.charAt(0).toUpperCase() : username.charAt(0).toUpperCase()}
                  </div>
                  <div className="preview-label">
                    <span className="label-icon">✨</span>
                    <span>Auto-generated Avatar</span>
                  </div>
                </div>
              ) : imageSrc ? (
                // Image editor preview
                <div className="image-editor-preview">
                  <ReactCrop
                    crop={crop}
                    onChange={onCropChange}
                    aspect={aspectRatio}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Edit avatar"
                      style={getImageStyle()}
                      onLoad={onImageLoad}
                      className="editable-image"
                    />
                  </ReactCrop>
                  <div className="preview-label">
                    <span className="label-icon">🖼️</span>
                    <span>Image Editor</span>
                  </div>
                </div>
              ) : (
                // Upload placeholder
                <div className="upload-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📷</div>
                    <h4>Upload an Image</h4>
                    <p>Choose a photo or generate an avatar from your username</p>
                    <div className="upload-options">
                      <button 
                        className="upload-btn primary"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        📁 Choose File
                      </button>
                      <button 
                        className="upload-btn secondary"
                        onClick={() => setAutoAvatarSettings(prev => ({ ...prev, useAutoGenerate: true }))}
                      >
                        ✨ Generate Avatar
                      </button>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setImageSrc(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                        // Clear the file input value so the same file can be selected again
                        e.target.value = '';
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="controls-section">
            <div className="controls-header">
              <h4>Customization Options</h4>
              <p>Choose your preferred method and customize your avatar</p>
            </div>

            <div className="controls-content">
              {/* Method Selection */}
              <div className="method-selection">
                <div className="method-tabs">
                  <button 
                    className={`method-tab ${!autoAvatarSettings.useAutoGenerate ? 'active' : ''}`}
                    onClick={() => setAutoAvatarSettings(prev => ({ ...prev, useAutoGenerate: false }))}
                  >
                    <span className="tab-icon">🖼️</span>
                    <span className="tab-text">Upload Image</span>
                  </button>
                  <button 
                    className={`method-tab ${autoAvatarSettings.useAutoGenerate ? 'active' : ''}`}
                    onClick={() => setAutoAvatarSettings(prev => ({ ...prev, useAutoGenerate: true }))}
                  >
                    <span className="tab-icon">✨</span>
                    <span className="tab-text">Generate Avatar</span>
                  </button>
                </div>
              </div>

              {/* Auto Generate Controls */}
              {autoAvatarSettings.useAutoGenerate && (
                <div className="auto-generate-panel">
                  <div className="panel-section">
                    <h5>Quick Color Schemes</h5>
                    <div className="color-schemes-grid">
                      {COLOR_SCHEMES.map((scheme) => (
                        <button
                          key={scheme.name}
                          onClick={() => applyColorScheme(scheme.name)}
                          className={`color-scheme-btn ${selectedColorScheme === scheme.name ? 'active' : ''}`}
                          style={{
                            backgroundColor: scheme.bg,
                            color: scheme.text
                          }}
                          title={scheme.name}
                        >
                          {scheme.name.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel-section">
                    <h5>Custom Colors</h5>
                    <div className="custom-colors">
                      <div className="color-picker">
                        <label>Background</label>
                        <input
                          type="color"
                          value={autoAvatarSettings.backgroundColor}
                          onChange={(e) => setAutoAvatarSettings(prev => ({
                            ...prev,
                            backgroundColor: e.target.value
                          }))}
                        />
                      </div>
                      <div className="color-picker">
                        <label>Text</label>
                        <input
                          type="color"
                          value={autoAvatarSettings.textColor}
                          onChange={(e) => setAutoAvatarSettings(prev => ({
                            ...prev,
                            textColor: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="panel-section">
                    <h5>Font Style</h5>
                    <select
                      value={autoAvatarSettings.fontStyle}
                      onChange={(e) => setAutoAvatarSettings(prev => ({
                        ...prev,
                        fontStyle: e.target.value
                      }))}
                      className="font-select"
                    >
                      {FONT_STYLES.map((font) => (
                        <option key={font.name} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Image Editor Controls */}
              {!autoAvatarSettings.useAutoGenerate && imageSrc && (
                <div className="image-editor-panel">
                  {/* Transform Controls */}
                  <div className="panel-section">
                    <h5>Transform</h5>
                    <div className="transform-controls">
                      <div className="control-group">
                        <label>Zoom</label>
                        <div className="zoom-controls">
                          <button onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}>
                            🔍−
                          </button>
                          <span className="zoom-display">{Math.round(scale * 100)}%</span>
                          <button onClick={() => setScale(prev => Math.min(3, prev + 0.1))}>
                            🔍+
                          </button>
                        </div>
                      </div>
                      
                      <div className="control-group">
                        <label>Rotate</label>
                        <div className="rotate-controls">
                          <button onClick={() => rotateImage('left')}>
                            ↶ Left
                          </button>
                          <button onClick={() => rotateImage('right')}>
                            ↷ Right
                          </button>
                        </div>
                      </div>

                      <div className="control-group">
                        <label>Flip</label>
                        <div className="flip-controls">
                          <button 
                            onClick={flipHorizontal}
                            className={flip.horizontal ? 'active' : ''}
                          >
                            ↔ Horizontal
                          </button>
                          <button 
                            onClick={flipVertical}
                            className={flip.vertical ? 'active' : ''}
                          >
                            ↕ Vertical
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="panel-section">
                    <div className="section-header">
                      <h5>Filters</h5>
                      <button 
                        className="toggle-btn"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        {showFilters ? '−' : '+'}
                      </button>
                    </div>
                    {showFilters && (
                      <div className="filter-grid">
                        {Object.entries(FILTER_PRESETS).map(([key, filter]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedFilter(key)}
                            className={`filter-btn ${selectedFilter === key ? 'active' : ''}`}
                            title={filter.name}
                          >
                            <div 
                              className="filter-preview"
                              style={{ filter: filter.filter }}
                            />
                            <span>{filter.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Adjustment Controls */}
                  <div className="panel-section">
                    <div className="section-header">
                      <h5>Adjustments</h5>
                      <button 
                        className="toggle-btn"
                        onClick={() => setShowAdjustments(!showAdjustments)}
                      >
                        {showAdjustments ? '−' : '+'}
                      </button>
                    </div>
                    {showAdjustments && (
                      <div className="adjustment-controls">
                        {[
                          { key: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%' },
                          { key: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%' },
                          { key: 'saturation', label: 'Saturation', min: 0, max: 200, unit: '%' },
                          { key: 'hue', label: 'Hue', min: -180, max: 180, unit: '°' },
                          { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.5, unit: 'px' }
                        ].map(({ key, label, min, max, step = 1, unit }) => (
                          <div key={key} className="adjustment-slider">
                            <label>{label}</label>
                            <input
                              type="range"
                              min={min}
                              max={max}
                              step={step}
                              value={manualAdjustments[key]}
                              onChange={(e) => setManualAdjustments(prev => ({
                                ...prev,
                                [key]: parseFloat(e.target.value)
                              }))}
                            />
                            <span>{manualAdjustments[key]}{unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reset Section */}
              <div className="panel-section">
                <button onClick={resetTransformations} className="reset-btn">
                  🔄 Reset All Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="avatar-editor-footer">
          <div className="footer-content">
            <button onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="save-btn"
              disabled={!imageSrc && !autoAvatarSettings.useAutoGenerate}
            >
              {autoAvatarSettings.useAutoGenerate ? 'Generate & Save' : 'Save Avatar'}
            </button>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default AvatarEditor;