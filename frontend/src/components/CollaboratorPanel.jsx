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
      onUpdate(); // Refresh note data
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
      onUpdate(); // Refresh note data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const handlePermissionChange = async (userId, newPermission) => {
    try {
      setError('');
      await notesService.updateCollaboratorPermission(noteId, userId, newPermission);
      onUpdate(); // Refresh note data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permission');
    }
  };

  return (
    <div className="collaborator-panel-overlay" onClick={onClose}>
      <div className="collaborator-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Share Note</h3>
          <button onClick={onClose} className="btn-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Collaborator Form */}
        <form onSubmit={handleAddCollaborator} className="add-collaborator-form">
          <div className="form-row">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="collaborator-email-input"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="permission-select"
            >
              <option value="read">Can view</option>
              <option value="write">Can edit</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-add-collaborator" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>

        {error && <div className="panel-error">{error}</div>}

        {/* Current Collaborators */}
        <div className="collaborators-list">
          <h4>People with access</h4>
          {collaborators.length === 0 ? (
            <p className="no-collaborators">No collaborators yet</p>
          ) : (
            <ul>
              {collaborators.map((collab) => (
                <li key={collab.user._id} className="collaborator-item">
                  <div className="collaborator-info">
                    <div className="collaborator-avatar">
                      {collab.user.avatar ? (
                        <img src={collab.user.avatar} alt={collab.user.name} />
                      ) : (
                        <span>{collab.user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="collaborator-details">
                      <span className="collaborator-name">{collab.user.name}</span>
                      <span className="collaborator-email">{collab.user.email}</span>
                    </div>
                  </div>
                  <div className="collaborator-actions">
                    <select
                      value={collab.permission}
                      onChange={(e) => handlePermissionChange(collab.user._id, e.target.value)}
                      className="permission-select-small"
                    >
                      <option value="read">View</option>
                      <option value="write">Edit</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveCollaborator(collab.user._id)}
                      className="btn-remove-collaborator"
                      title="Remove collaborator"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
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
