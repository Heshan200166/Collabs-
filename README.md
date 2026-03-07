# Collabs+

A collaborative note-taking application built with the MERN stack. Create, edit, and share notes with real-time collaboration features.

## Features

- **User Authentication** - Secure registration and login with JWT tokens
- **Notes Management** - Create, read, update, and delete personal notes
- **Rich Text Editor** - Format notes with headings, lists, code blocks, and more
- **Real-time Collaboration** - Share notes with other users
- **Role-based Permissions** - Assign Viewer (read-only) or Editor (read/write) roles to collaborators
- **Search** - Find notes and users quickly with instant search
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, React Router, React Quill |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT, bcrypt |
| Dev Tools | Nodemon, Concurrently |

## Project Structure

```
Collabs+/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── noteController.js  # Notes CRUD operations
│   │   └── searchController.js # Search functionality
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── errorMiddleware.js # Error handling
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Note.js            # Note schema with collaborators
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── notes.js           # Notes endpoints
│   │   └── search.js          # Search endpoints
│   └── server.js              # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CollaboratorPanel.jsx  # Share modal
│   │   │   └── ProtectedRoute.jsx     # Route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth state management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Notes listing
│   │   │   ├── NoteEditor.jsx         # Note editor/viewer
│   │   │   ├── Login.jsx              # Login page
│   │   │   └── Register.jsx           # Registration page
│   │   └── services/
│   │       ├── api.js                 # Axios instance
│   │       ├── authService.js         # Auth API calls
│   │       └── notesService.js        # Notes API calls
│   ├── index.html
│   └── vite.config.js
└── package.json               # Root scripts
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Collabs+
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   Copy the example files and update with your values:
   
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend (optional)
   cp frontend/.env.example frontend/.env
   ```

4. **Update backend/.env with your settings:**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collabsplus
   NODE_ENV=development
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRE=30d
   ```

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRE` | Token expiration time | `30d` |

#### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | Empty (uses proxy) |

### Running the Application

**Development mode (frontend + backend):**
```bash
npm run dev
```

**Backend only:**
```bash
npm run backend
```

**Frontend only:**
```bash
npm run frontend
```

### Default Ports

| Service | URL |
|---------|-----|
| Backend API | http://localhost:5000 |
| Frontend | http://localhost:3000 |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all user's notes |
| GET | `/api/notes/:id` | Get a specific note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| POST | `/api/notes/:id/collaborators` | Add a collaborator |
| DELETE | `/api/notes/:id/collaborators/:userId` | Remove a collaborator |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/users?q=query` | Search users by email |
| GET | `/api/search/notes?q=query` | Search notes by title |

## Usage

1. **Register/Login** - Create an account or sign in
2. **Create Notes** - Click "New Note" to create a note with rich text formatting
3. **Share Notes** - Click "Share" to invite collaborators
4. **Set Permissions** - Choose "Viewer" for read-only or "Editor" for full access
5. **Collaborate** - Collaborators can view or edit based on their assigned role

## License

MIT

