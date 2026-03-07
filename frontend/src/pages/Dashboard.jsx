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
  const [activeTab, setActiveTab] = useState('all');

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

  const handleNewNote = () => {
    navigate('/notes/new');
  };

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (activeTab === 'owned') {
      filtered = filtered.filter(note => note.owner?._id === user?._id);
    } else if (activeTab === 'shared') {
      filtered = filtered.filter(note => note.owner?._id !== user?._id);
    }

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

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-white">Collabs+</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Notes
            <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">{notes.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('owned')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
              activeTab === 'owned'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Notes
            <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">{ownedCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('shared')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
              activeTab === 'shared'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Shared with Me
            <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">{sharedCount}</span>
          </button>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-900">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          {/* Search */}
          <div className="relative w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* New Note Button */}
          <button
            onClick={handleNewNote}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
              <p>Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400 mb-1">
                {searchQuery
                  ? 'No notes found'
                  : activeTab === 'shared'
                  ? 'No shared notes yet'
                  : 'No notes yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : activeTab === 'shared'
                  ? 'Notes shared with you will appear here'
                  : 'Create your first note to get started'}
              </p>
              {!searchQuery && activeTab !== 'shared' && (
                <button
                  onClick={handleNewNote}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => handleNoteClick(note._id)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-600 hover:bg-gray-750 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white truncate flex-1 group-hover:text-indigo-400 transition-colors">
                      {note.title || 'Untitled'}
                    </h3>
                    {note.owner?._id !== user?._id && (
                      <span className="ml-2 px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">
                        Shared
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {stripHtml(note.content)?.substring(0, 100) || 'No content'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    {note.collaborators?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {note.collaborators.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
