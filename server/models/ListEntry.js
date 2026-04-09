const mongoose = require('mongoose');

const listEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  malId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['manga', 'anime'],
    required: true
  },
  status: {
    type: String,
    enum: ['reading', 'completed', 'plan_to_read', 'dropped'],
    default: 'plan_to_read'
  },
  progress: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  }
}, { timestamps: true });

listEntrySchema.index({ userId: 1, malId: 1 }, { unique: true });

module.exports = mongoose.model('ListEntry', listEntrySchema);