const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorPermission
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Note CRUD routes
router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

// Collaborator routes
router.route('/:id/collaborators')
  .post(addCollaborator);

router.route('/:id/collaborators/:userId')
  .put(updateCollaboratorPermission)
  .delete(removeCollaborator);

module.exports = router;
