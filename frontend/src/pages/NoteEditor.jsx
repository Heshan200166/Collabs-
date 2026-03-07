import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import notesService from '../services/notesService';
import { useAuth } from '../context/AuthContext';
import CollaboratorPanel from '../components/CollaboratorPanel';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewNote = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNewNote);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [noteId, setNoteId] = useState(id !== 'new' ? id : null);
  const [noteOwner, setNoteOwner] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showSharePanel, setShowSharePanel] = useState(false);

  const isOwner = noteOwner && user && noteOwner._id === user._id;

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link',
  ];

  // Fetch note if editing existing
  useEffect(() => {
    if (!isNewNote && id) {
      fetchNote();
    }
  }, [id, isNewNote]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notesService.getNote(id);
      const note = response.data;
      setTitle(note.title || '');
      setContent(note.content || '');
      setLastUpdated(note.updatedAt);
      setNoteId(note._id);
      setNoteOwner(note.owner);
      setCollaborators(note.collaborators || []);
    } catch (err) {
      setError('Failed to load note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let response;
      if (noteId) {
        // Update existing note
        response = await notesService.updateNote(noteId, { title, content });
      } else {
        // Create new note
        response = await notesService.createNote({ title, content });
        setNoteId(response.data._id);
        setNoteOwner(response.data.owner || user);
        // Update URL to reflect the new note ID
        navigate(`/notes/${response.data._id}`, { replace: true });
      }

      setLastUpdated(response.data.updatedAt || new Date().toISOString());
    } catch (err) {
      setError('Failed to save note');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId) {
      navigate('/dashboard');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      await notesService.deleteNote(noteId);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="editor-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Header */}
      <header className="editor-header">
        <button onClick={handleBack} className="btn-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="editor-actions">
          {/* Share button - only visible to owner */}
          {(isOwner || isNewNote) && noteId && (
            <button
              onClick={() => setShowSharePanel(true)}
              className="btn-share"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
              Share
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="btn-delete"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            onClick={handleSave}
            className="btn-save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Editor Content */}
      <div className="editor-content">
        {/* Title Input */}
        <input
          type="text"
          className="note-title-input"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Last Updated */}
        {lastUpdated && (
          <p className="last-updated">
            Last updated: {formatDate(lastUpdated)}
          </p>
        )}

        {/* Rich Text Editor */}
        <div className="quill-wrapper">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Start writing..."
          />
        </div>
      </div>

      {/* Collaborator Panel */}
      {showSharePanel && noteId && (
        <CollaboratorPanel
          noteId={noteId}
          collaborators={collaborators}
          onUpdate={fetchNote}
          onClose={() => setShowSharePanel(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;
