import api from './api';

const notesService = {
  // Search users by email
  searchUsers: async (query) => {
    const response = await api.get('/search/users', { params: { q: query } });
    return response.data;
  },

  // Get all notes (owned + shared)
  getNotes: async (params = {}) => {
    const response = await api.get('/notes', { params });
    return response.data;
  },

  // Get single note
  getNote: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Create new note
  createNote: async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  // Update note
  updateNote: async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  // Delete note
  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  // Add collaborator
  addCollaborator: async (noteId, userData) => {
    const response = await api.post(`/notes/${noteId}/collaborators`, userData);
    return response.data;
  },

  // Remove collaborator
  removeCollaborator: async (noteId, userId) => {
    const response = await api.delete(`/notes/${noteId}/collaborators/${userId}`);
    return response.data;
  },

  // Update collaborator permission
  updateCollaboratorPermission: async (noteId, userId, permission) => {
    const response = await api.put(`/notes/${noteId}/collaborators/${userId}`, { permission });
    return response.data;
  },
};

export default notesService;
