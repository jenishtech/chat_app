# Backend Structure Documentation

This backend follows a proper MVC (Model-View-Controller) architecture with organized routes, controllers, and middleware.

## Project Structure

```
backend/
├── controllers/          # Business logic handlers
│   ├── uploadController.js
│   ├── groupController.js
│   ├── pollController.js
│   └── socketController.js
├── middleware/           # Middleware functions
│   └── socketMiddleware.js
├── models/              # Database models
│   ├── User.js
│   ├── Group.js
│   ├── Message.js
│   └── Poll.js
├── routes/              # API route definitions
│   ├── auth.js
│   ├── upload.js
│   ├── group.js
│   └── poll.js
├── uploads/             # File upload directory
├── index.js             # Main server file
├── Db.js               # Database connection
└── package.json
```

## Architecture Overview

### 1. Models (`/models`)
- **User.js**: User schema with username, email, password, avatarUrl, and bio
- **Group.js**: Group schema with name, members, avatarUrl, description, and pinnedMessages
- **Message.js**: Message schema with sender, recipient, content, reactions, mentions, etc.
- **Poll.js**: Poll schema with question, options, votes, and expiration

### 2. Controllers (`/controllers`)
- **uploadController.js**: Handles file uploads, avatar uploads, and group avatar uploads
- **groupController.js**: Manages group operations (create, update, delete, leave)
- **pollController.js**: Handles poll-related operations
- **socketController.js**: Manages all Socket.IO real-time communication

### 3. Routes (`/routes`)
- **auth.js**: Authentication routes (login, register)
- **upload.js**: File upload endpoints
- **group.js**: Group management endpoints
- **poll.js**: Poll-related endpoints

### 4. Middleware (`/middleware`)
- **socketMiddleware.js**: Sets up Socket.IO event handlers and connection management

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration

### Upload (`/api/upload`)
- `POST /media` - Upload media files
- `POST /avatar` - Upload user avatar
- `POST /group-avatar` - Upload group avatar

### Groups (`/api/group`)
- `PATCH /description` - Update group description
- `PATCH /name` - Update group name
- `PATCH /members` - Update group members
- `POST /leave` - Leave group
- `DELETE /` - Delete group

### Polls (`/api/polls`)
- `GET /:groupName` - Get polls for a specific group

## Socket.IO Events

All real-time communication is handled through Socket.IO events:

### Connection Events
- `join` - User joins the chat
- `disconnect` - User disconnects

### Message Events
- `send_message` - Send a message
- `delete_message` - Delete a message
- `edit_message` - Edit a message
- `message_seen` - Mark message as seen
- `react_message` - React to a message
- `pin_message` - Pin a message
- `unpin_message` - Unpin a message

### Group Events
- `create_group` - Create a new group

### Poll Events
- `create_poll` - Create a new poll
- `vote_poll` - Vote on a poll
- `close_poll` - Close a poll

### Typing Indicators
- `typing` - User is typing
- `stop_typing` - User stopped typing

## Key Features

1. **Real-time Communication**: All chat functionality is real-time using Socket.IO
2. **File Uploads**: Support for images, videos, and other media files
3. **Group Management**: Create, update, and manage chat groups
4. **Message Features**: Edit, delete, react, pin, and forward messages
5. **Poll System**: Create and vote on polls within groups
6. **User Management**: Avatar uploads, bio updates, and user profiles
7. **Mentions**: Support for @mentions in group chats
8. **Message History**: Persistent message storage and retrieval

## Database

The application uses MongoDB with Mongoose ODM for data persistence. All models include proper validation and indexing for optimal performance.

## Environment Variables

Required environment variables:
- `PORT` - Server port
- `CLIENT_URL` - Frontend URL for CORS
- `SERVER_URL` - Backend URL for file uploads
- MongoDB connection string (configured in Db.js)

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start the server: `npm start`
4. The server will be available on the configured port

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a specific responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Scalability**: Easy to add new features and endpoints
4. **Testability**: Controllers can be easily unit tested
5. **Code Reusability**: Common functionality is shared across routes
6. **Clean Architecture**: Follows industry best practices 