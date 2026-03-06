const Note = require('../models/Note');

// @desc    Advanced full-text search across notes
// @route   GET /api/search
// @access  Private
exports.searchNotes = async (req, res, next) => {
  try {
    const { q, tag, owner, sortBy, limit = 20, page = 1 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Build base query - user must have access
    const baseQuery = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ],
      isArchived: false
    };

    // Full-text search with score
    const searchQuery = {
      ...baseQuery,
      $text: { $search: q }
    };

    // Optional: filter by tag
    if (tag) {
      searchQuery.tags = tag;
    }

    // Optional: only owned notes
    if (owner === 'me') {
      delete searchQuery.$or;
      searchQuery.owner = req.user._id;
    }

    // Determine sort order
    let sortOption = { score: { $meta: 'textScore' }, updatedAt: -1 };
    if (sortBy === 'date') {
      sortOption = { updatedAt: -1 };
    } else if (sortBy === 'title') {
      sortOption = { title: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with text score
    const notes = await Note.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Note.countDocuments(searchQuery);

    // Add search metadata to results
    const results = notes.map(note => {
      const noteObj = note.toObject();
      
      // Determine user's role
      const isOwner = note.owner._id.toString() === req.user._id.toString();
      const collaborator = note.collaborators.find(
        c => c.user._id.toString() === req.user._id.toString()
      );
      
      return {
        ...noteObj,
        searchScore: noteObj.score,
        userRole: isOwner ? 'owner' : collaborator?.permission || 'none',
        // Create snippet/preview from content
        preview: createPreview(note.content, q)
      };
    });

    res.json({
      success: true,
      query: q,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/search/suggestions
// @access  Private
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Get user's note titles and tags that match
    const notes = await Note.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ],
      isArchived: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    })
      .select('title tags')
      .limit(10);

    // Extract unique suggestions
    const suggestions = new Set();
    
    notes.forEach(note => {
      // Add matching titles
      if (note.title.toLowerCase().includes(q.toLowerCase())) {
        suggestions.add(note.title);
      }
      // Add matching tags
      note.tags.forEach(tag => {
        if (tag.toLowerCase().includes(q.toLowerCase())) {
          suggestions.add(`#${tag}`);
        }
      });
    });

    res.json({
      success: true,
      data: Array.from(suggestions).slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique tags for user
// @route   GET /api/search/tags
// @access  Private
exports.getAllTags = async (req, res, next) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ],
      isArchived: false
    }).select('tags');

    // Aggregate all tags with count
    const tagCounts = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Create preview snippet from content
function createPreview(content, query, maxLength = 150) {
  if (!content) return '';
  
  // Strip HTML tags for preview
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Try to find query in content and show surrounding context
  const lowerContent = plainText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryIndex = lowerContent.indexOf(lowerQuery);
  
  if (queryIndex !== -1) {
    // Show snippet around the match
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(plainText.length, queryIndex + query.length + 100);
    let snippet = plainText.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < plainText.length) snippet = snippet + '...';
    
    return snippet;
  }
  
  // No match in content, return beginning
  return plainText.length > maxLength 
    ? plainText.slice(0, maxLength) + '...' 
    : plainText;
}
