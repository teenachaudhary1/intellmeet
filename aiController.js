const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Message = require('../models/Message');

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${socket.id})`);

    socket.on('join_meeting', async ({ meetingId }) => {
      try {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) return socket.emit('error', { message: 'Meeting not found' });
        socket.join(`meeting:${meetingId}`);
        const already = meeting.participants.some(p => p.user.toString() === user._id.toString());
        if (!already) { meeting.participants.push({ user: user._id, joinedAt: new Date() }); await meeting.save(); }
        socket.to(`meeting:${meetingId}`).emit('user_joined', { userId: user._id, name: user.name, avatarUrl: user.avatarUrl });
        const messages = await Message.find({ meeting: meetingId }).populate('sender', 'name avatarUrl').sort({ createdAt: 1 }).limit(50);
        socket.emit('recent_messages', messages);
      } catch (error) { socket.emit('error', { message: error.message }); }
    });

    socket.on('send_message', async ({ meetingId, content }) => {
      try {
        if (!content?.trim()) return;
        const message = await Message.create({ meeting: meetingId, sender: user._id, content: content.trim() });
        await message.populate('sender', 'name avatarUrl');
        io.to(`meeting:${meetingId}`).emit('new_message', message);
      } catch (error) { socket.emit('error', { message: error.message }); }
    });

    socket.on('toggle_media', ({ meetingId, isMuted, isVideoOn }) => {
      socket.to(`meeting:${meetingId}`).emit('participant_media_update', { userId: user._id, isMuted, isVideoOn });
    });

    socket.on('leave_meeting', async ({ meetingId }) => {
      socket.leave(`meeting:${meetingId}`);
      socket.to(`meeting:${meetingId}`).emit('user_left', { userId: user._id, name: user.name });
      await Meeting.updateOne({ _id: meetingId, 'participants.user': user._id }, { $set: { 'participants.$.leftAt': new Date() } });
    });

    socket.on('disconnect', () => console.log(`🔌 Socket disconnected: ${user.name}`));
  });
};

module.exports = { initSocket };
