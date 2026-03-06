const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Get all notes for current user (owned + collaborated)
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const { search, tag, archived, pinned } = req.query;
    
    // Build query - get notes where user is owner or collaborator
    let query = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    };

    // Filter by archived status
    if (archived !== undefined) {
      query.isArchived = archived === 'true';
    } else {
      query.isArchived = false; // Default: show non-archived
    }

    // Filter by pinned
    if (pinned === 'true') {
      query.isPinned = true;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .populate('lastEditedBy', 'name email')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .populate('lastEditedBy', 'name email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user has access
    const hasAccess = note.owner._id.toString() === req.user._id.toString() ||
      note.collaborators.some(c => c.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this note'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    const { title, content, tags, color } = req.body;

    const note = await Note.create({
      title,
      content,
      tags,
      color,
      owner: req.user._id,
      lastEditedBy: req.user._id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check permissions
    const isOwner = note.owner.toString() === req.user._id.toString();
    const collaborator = note.collaborators.find(
      c => c.user.toString() === req.user._id.toString()
    );
    const canEdit = isOwner || (collaborator && ['write', 'admin'].includes(collaborator.permission));

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this note'
      });
    }

    const { title, content, tags, color, isPinned, isArchived } = req.body;

    note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        tags,
        color,
        isPinned,
        isArchived,
        lastEditedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .populate('lastEditedBy', 'name email');

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Only owner can delete
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this note'
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add collaborator to note
// @route   POST /api/notes/:id/collaborators
// @access  Private (Owner only)
exports.addCollaborator = async (req, res, next) => {
  try {
    const { email, permission } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide collaborator email'
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Only owner can add collaborators
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the note owner can add collaborators'
      });
    }

    // Find user by email - must have an account
    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = note.collaborators.find(
      c => c.user.toString() === userToAdd._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator'
      });
    }

    // Can't add owner as collaborator
    if (userToAdd._id.toString() === note.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add owner as collaborator'
      });
    }

    note.collaborators.push({
      user: userToAdd._id,
      permission: permission || 'read'
    });

    await note.save();

    const updatedNote = await Note.findById(note._id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    res.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator from note
// @route   DELETE /api/notes/:id/collaborators/:userId
// @access  Private (Owner only, or self-removal)
exports.removeCollaborator = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Only owner can remove collaborators (or collaborator can remove themselves)
    const isOwner = note.owner.toString() === req.user._id.toString();
    const isSelf = req.params.userId === req.user._id.toString();

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Only the note owner can remove collaborators'
      });
    }

    note.collaborators = note.collaborators.filter(
      c => c.user.toString() !== req.params.userId
    );

    await note.save();

    const updatedNote = await Note.findById(note._id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    res.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update collaborator permission
// @route   PUT /api/notes/:id/collaborators/:userId
// @access  Private
exports.updateCollaboratorPermission = async (req, res, next) => {
  try {
    const { permission } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Only owner can update permissions
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can update permissions'
      });
    }

    const collaborator = note.collaborators.find(
      c => c.user.toString() === req.params.userId
    );

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Collaborator not found'
      });
    }

    collaborator.permission = permission;
    await note.save();

    const updatedNote = await Note.findById(note._id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    res.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};
