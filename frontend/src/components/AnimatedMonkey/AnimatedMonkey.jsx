import React, { useState, useEffect } from 'react';
import './AnimatedMonkey.css';

const AnimatedMonkey = ({ 
  isTyping = false, 
  isSuccess = null, 
  isRegister = false,
  isLoading = false 
}) => {
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [message, setMessage] = useState('Hello! Ready to chat? 🐵');
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setCurrentAnimation('thinking');
      setMessage('Processing... 🤔');
      setShowMessage(true);
    } else if (isSuccess === true) {
      setCurrentAnimation('happy');
      setMessage(isRegister ? 'Welcome aboard! 🎉' : 'Welcome back! 🎉');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } else if (isSuccess === false) {
      setCurrentAnimation('sad');
      setMessage('Oops! Something went wrong 😅');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } else if (isTyping) {
      setCurrentAnimation('typing');
      setMessage('I see you typing... 👀');
      setShowMessage(true);
    } else {
      setCurrentAnimation('idle');
      setMessage('Hello! Ready to chat? 🐵');
      setShowMessage(true);
    }
  }, [isTyping, isSuccess, isRegister, isLoading]);

  return (
    <div className="monkey-container">
      <div className={`monkey ${currentAnimation}`}>
        {/* Monkey Face */}
        <div className="monkey-face">
          {/* Ears */}
          <div className="ear left-ear"></div>
          <div className="ear right-ear"></div>
          
          {/* Face circle */}
          <div className="face-circle">
            {/* Eyes */}
            <div className="eye left-eye">
              <div className="pupil"></div>
            </div>
            <div className="eye right-eye">
              <div className="pupil"></div>
            </div>
            
            {/* Nose */}
            <div className="nose"></div>
            
            {/* Mouth */}
            <div className="mouth"></div>
            
            {/* Cheeks */}
            <div className="cheek left-cheek"></div>
            <div className="cheek right-cheek"></div>
          </div>
        </div>
        
        {/* Body */}
        <div className="monkey-body">
          {/* Arms */}
          <div className="arm left-arm"></div>
          <div className="arm right-arm"></div>
          
          {/* Hands */}
          <div className="hand left-hand"></div>
          <div className="hand right-hand"></div>
        </div>
        
        {/* Legs */}
        <div className="leg left-leg"></div>
        <div className="leg right-leg"></div>
        
        {/* Feet */}
        <div className="foot left-foot"></div>
        <div className="foot right-foot"></div>
      </div>
      
      {/* Message Bubble */}
      {showMessage && (
        <div className={`message-bubble ${currentAnimation}`}>
          <div className="message-text">{message}</div>
          <div className="bubble-tail"></div>
        </div>
      )}
    </div>
  );
};

export default AnimatedMonkey; 