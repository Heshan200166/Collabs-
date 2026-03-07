import { useState, useEffect } from 'react';
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

  // Check if user is a viewer (collaborator with read-only permission)
  const userCollaborator = collaborators.find(c => c.user?._id === user?._id);
  const isViewer = !isOwner && !isNewNote && userCollaborator?.permission === 'read';
  const canEdit = isOwner || isNewNote || userCollaborator?.permission === 'write';

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
        response = await notesService.updateNote(noteId, { title, content });
      } else {
        response = await notesService.createNote({ title, content });
      }

      navigate('/dashboard');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to notes
        </button>

        <div className="flex items-center gap-2">
          {(isOwner || isNewNote) && noteId && (
            <button
              onClick={() => setShowSharePanel(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-red-400 hover:text-white hover:bg-red-600 border border-red-900 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-6">
        {/* Title - Read-only in viewer mode */}
        {isViewer ? (
          <h1 className="w-full text-3xl font-bold text-white mb-2 pb-2">
            {title || 'Untitled'}
          </h1>
        ) : (
          <input
            type="text"
            placeholder="Untitled note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-700 focus:border-indigo-500 text-white placeholder-gray-600 focus:outline-none mb-2 pb-2 transition-colors"
          />
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <span>Last updated: {formatDate(lastUpdated)}</span>
            {isViewer && (
              <>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View only
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">Owner: <span className="text-gray-400">{noteOwner?.name}</span></span>
              </>
            )}
          </div>
        )}

        {/* Rich Text Editor / Viewer */}
        {isViewer ? (
          <div 
            className="prose-content bg-gray-800 rounded-lg p-6 min-h-[400px] text-gray-100"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose-editor">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Start writing..."
            />
          </div>
        )}
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
