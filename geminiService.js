# ====================================
# IntellMeet Backend — Environment Variables
# Copy this file to .env and fill in your values
# ====================================

# Server
NODE_ENV=development
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/intellmeet?retryWrites=true&w=majority

# JWT — generate a strong random secret (e.g. openssl rand -base64 64)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google Gemini API Key — https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
