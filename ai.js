const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
  isMuted: { type: Boolean, default: false },
  isVideoOn: { type: Boolean, default: true },
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000 },
  agenda: { type: String, trim: true, maxlength: 2000 },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [participantSchema],
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  duration: { type: Number, default: null },
  summary: {
    content: String,
    keyPoints: [String],
    decisions: [String],
    nextSteps: [String],
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    generatedAt: Date,
  },
  transcript: [{ speaker: String, content: String, timestamp: Number }],
  recordingUrl: { type: String, default: null },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

meetingSchema.virtual('participantCount').get(function() { return this.participants?.length || 0; });
meetingSchema.set('toJSON', { virtuals: true });
meetingSchema.set('toObject', { virtuals: true });
meetingSchema.index({ host: 1, status: 1 });
meetingSchema.index({ scheduledAt: 1 });
meetingSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
