const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 300 },
  description: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

actionItemSchema.index({ assignee: 1, status: 1 });
actionItemSchema.index({ meeting: 1 });
module.exports = mongoose.model('ActionItem', actionItemSchema);
