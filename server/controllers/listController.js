const ListEntry = require('../models/ListEntry');

// GET /api/list — get all entries for logged-in user
exports.getList = async (req, res) => {
  try {
    const entries = await ListEntry.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/list — add new entry
exports.addEntry = async (req, res) => {
  try {
    const { malId, title, coverImage, type, status, progress, rating } = req.body;

    const entry = await ListEntry.create({
      userId: req.user._id,
      malId,
      title,
      coverImage,
      type,
      status,
      progress,
      rating
    });

    res.status(201).json({ success: true, entry });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'This title is already in your list' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/list/:id — update status, progress, or rating
exports.updateEntry = async (req, res) => {
  try {
    const { status, progress, rating } = req.body;

    const entry = await ListEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status, progress, rating },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.status(200).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/list/:id — remove entry
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await ListEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.status(200).json({ success: true, message: 'Entry removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};