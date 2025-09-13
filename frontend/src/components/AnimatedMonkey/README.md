# Animated Monkey Component

A delightful animated monkey character that reacts to user interactions on the login page with various animations and messages.

## Features

### 🐵 Interactive Animations
- **Idle State**: Gentle breathing animation with blinking eyes
- **Typing Detection**: Monkey looks around and shows typing animation when user is typing
- **Success State**: Happy animation with celebration message
- **Error State**: Sad animation with comforting message
- **Loading State**: Thinking animation while processing

### 🎨 Visual Elements
- **Face**: Animated eyes, nose, mouth, and cheeks
- **Body**: Arms, hands, legs, and feet with natural movements
- **Ears**: Gentle wiggling animation
- **Message Bubble**: Contextual messages with different colors and animations

### 📱 Responsive Design
- Adapts to different screen sizes
- Maintains proportions on mobile devices
- Optimized animations for performance

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isTyping` | boolean | false | Shows typing animation when true |
| `isSuccess` | boolean/null | null | Shows success (true) or error (false) animation |
| `isRegister` | boolean | false | Changes success message for registration |
| `isLoading` | boolean | false | Shows loading/thinking animation |

## Usage

```jsx
import AnimatedMonkey from './components/AnimatedMonkey/AnimatedMonkey';

<AnimatedMonkey 
  isTyping={isTyping}
  isSuccess={isSuccess}
  isRegister={isRegister}
  isLoading={isLoading}
/>
```

## Animation States

### 🎭 State Transitions
1. **Idle** → **Typing**: When user starts typing
2. **Typing** → **Idle**: After 1 second of no typing
3. **Any** → **Loading**: When form is submitted
4. **Loading** → **Success/Error**: Based on API response
5. **Success/Error** → **Idle**: After 3 seconds

### 💬 Messages
- **Idle**: "Hello! Ready to chat? 🐵"
- **Typing**: "I see you typing... 👀"
- **Loading**: "Processing... 🤔"
- **Success (Login)**: "Welcome back! 🎉"
- **Success (Register)**: "Welcome aboard! 🎉"
- **Error**: "Oops! Something went wrong 😅"

## CSS Classes

### Main Container
- `.monkey-container`: Main wrapper for the monkey and message bubble

### Monkey Parts
- `.monkey`: Main monkey element with state classes
- `.monkey-face`: Face container
- `.face-circle`: Main face circle
- `.ear`, `.eye`, `.nose`, `.mouth`, `.cheek`: Facial features
- `.monkey-body`, `.arm`, `.hand`, `.leg`, `.foot`: Body parts

### State Classes
- `.monkey.idle`: Default state
- `.monkey.typing`: Typing animation
- `.monkey.happy`: Success animation
- `.monkey.sad`: Error animation
- `.monkey.thinking`: Loading animation

### Message Bubble
- `.message-bubble`: Speech bubble container
- `.message-text`: Text content
- `.bubble-tail`: Speech bubble tail

## Customization

The component uses CSS custom properties and can be easily customized by modifying the CSS file. Key customization points:

- **Colors**: Monkey fur, eyes, mouth, etc.
- **Sizes**: Overall dimensions and proportions
- **Animations**: Timing and easing functions
- **Messages**: Text content and emojis

## Browser Support

- Modern browsers with CSS animations support
- Fallback animations for older browsers
- Mobile-friendly touch interactions 