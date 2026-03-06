import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import notesService from '../services/notesService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'owned', 'shared'

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notesService.getNotes();
      setNotes(response.data || []);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewNote = async () => {
    try {
      const response = await notesService.createNote({
        title: 'Untitled Note',
        content: '',
      });
      // Navigate to the new note or add to list
      setNotes([response.data, ...notes]);
    } catch (err) {
      setError('Failed to create note');
    }
  };

  // Filter notes based on search and tab
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by tab
    if (activeTab === 'owned') {
      filtered = filtered.filter(note => note.owner?._id === user?._id);
    } else if (activeTab === 'shared') {
      filtered = filtered.filter(note => note.owner?._id !== user?._id);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [notes, activeTab, searchQuery, user]);

  const ownedCount = notes.filter(n => n.owner?._id === user?._id).length;
  const sharedCount = notes.filter(n => n.owner?._id !== user?._id).length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>My Notes</h1>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Search and Actions Bar */}
        <div className="notes-toolbar">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={handleNewNote} className="btn-new-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Note
          </button>
        </div>

        {/* Tabs */}
        <div className="notes-tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Notes ({notes.length})
          </button>
          <button
            className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => setActiveTab('owned')}
          >
            My Notes ({ownedCount})
          </button>
          <button
            className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            Shared with Me ({sharedCount})
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Notes Content */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>
              {searchQuery
                ? 'No notes found'
                : activeTab === 'shared'
                ? 'No shared notes yet'
                : 'No notes yet'}
            </h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : activeTab === 'shared'
                ? 'Notes shared with you will appear here'
                : 'Create your first note to get started'}
            </p>
            {!searchQuery && activeTab !== 'shared' && (
              <button onClick={handleNewNote} className="btn-primary">
                Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="note-card"
                style={{ borderLeftColor: note.color || '#646cff' }}
              >
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  {note.isPinned && (
                    <svg className="pin-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 4l4 4-1.5 1.5-1-1L12 14l-2-2 5.5-5.5-1-1L16 4z" />
                    </svg>
                  )}
                </div>
                <p className="note-preview">
                  {note.content?.substring(0, 120) || 'No content'}
                  {note.content?.length > 120 && '...'}
                </p>
                {note.tags?.length > 0 && (
                  <div className="note-tags">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="tag more">+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="note-footer">
                  <span className="note-meta">
                    {note.owner?._id !== user?._id && (
                      <span className="shared-badge">Shared</span>
                    )}
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  {note.collaborators?.length > 0 && (
                    <span className="collaborators-count">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      {note.collaborators.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
