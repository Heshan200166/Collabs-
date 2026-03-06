const express = require('express');
const router = express.Router();
const {
  searchNotes,
  getSearchSuggestions,
  getAllTags
} = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Search routes
router.get('/', searchNotes);
router.get('/suggestions', getSearchSuggestions);
router.get('/tags', getAllTags);

module.exports = router;
