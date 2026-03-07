import { useState } from 'react';
import notesService from '../services/notesService';

const CollaboratorPanel = ({ noteId, collaborators = [], onUpdate, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await notesService.addCollaborator(noteId, { email, permission });
      setEmail('');
      setPermission('read');
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!window.confirm('Remove this collaborator?')) {
      return;
    }

    try {
      setError('');
      await notesService.removeCollaborator(noteId, userId);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const handlePermissionChange = async (userId, newPermission) => {
    try {
      setError('');
      await notesService.updateCollaboratorPermission(noteId, userId, newPermission);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permission');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Share Note</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Collaborator Form */}
        <form onSubmit={handleAddCollaborator} className="p-4 border-b border-gray-700">
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="read">Viewer</option>
              <option value="write">Editor</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Adding...' : 'Add Collaborator'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Collaborators List */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">People with access</h4>
          
          {collaborators.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 font-medium mb-1">No collaborators yet</p>
              <p className="text-xs text-gray-600">Invite someone to collaborate on this note</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {collaborators.map((collab) => (
                <li 
                  key={collab.user._id} 
                  className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {collab.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white">{collab.user.name}</p>
                      <p className="text-xs text-gray-500">{collab.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={collab.permission}
                      onChange={(e) => handlePermissionChange(collab.user._id, e.target.value)}
                      className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs focus:outline-none"
                    >
                      <option value="read">Viewer</option>
                      <option value="write">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveCollaborator(collab.user._id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorPanel;
