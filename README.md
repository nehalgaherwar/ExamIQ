# ExamIQ - AI Exam Assistant

A full-stack application for exam preparation with AI-powered Q&A assistance.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Backend Setup

1. **Install dependencies:**
```bash
cd /path/to/examIQ
pip install -r requirements.txt
```

2. **Run the Flask server:**
```bash
python run.py
```

Server will start at `http://localhost:5000`

### Frontend

1. **Open in browser:**
   - Open `index.html` in your web browser
   - or use a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 📋 Features

### User Authentication
- Sign up with username and password
- Secure login with session tokens
- Persistent user sessions (7 days)

### Document Management
- Upload documents (PDF, DOC, TXT)
- View document previews
- Delete documents
- Max file size: 50MB

### AI Exam Assistant
- Ask exam-oriented questions
- Multiple language support:
  - English
  - Hinglish (Hinglish mix)
  - Hindi
- Difficulty levels:
  - 2 marks (short answer)
  - 5 marks (medium answer)
  - 10 marks (comprehensive answer)

### History & Output
- View all past exam outputs
- Review previous questions and answers
- Delete outputs
- Track exam performance

## 📁 Project Structure

```
examIQ/
├── index.html           # Frontend HTML
├── script.js           # Frontend JavaScript (API integration)
├── style.css           # Frontend CSS (responsive design)
├── requirements.txt     # Python dependencies
├── run.py              # Flask entry point
├── app/
│   ├── __init__.py     # Flask app initialization
│   ├── config.py       # Configuration settings
│   ├── models.py       # Database models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py     # Authentication endpoints
│   │   ├── documents.py # Document management endpoints
│   │   ├── questions.py # Q&A endpoints
│   │   └── history.py   # History endpoints
│   └── utils/
│       ├── __init__.py
│       └── ai_mock.py   # Mock AI response generator
├── uploads/            # User uploaded documents
└── examiq.db           # SQLite database (auto-created)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/validate` - Validate session token

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/list` - List user's documents
- `GET /api/documents/<id>/preview` - Get document preview
- `DELETE /api/documents/<id>` - Delete document

### Questions & Answers
- `POST /api/questions/ask` - Ask a question
- `GET /api/questions/<id>/details` - Get question details
- `POST /api/questions/<id>/like` - Mark as favorite

### History
- `GET /api/history/outputs` - Get all outputs
- `GET /api/history/<id>` - Get specific output
- `DELETE /api/history/<id>` - Delete output

## 🗄️ Database Schema

### Users
- `id`, `username`, `password_hash`, `created_at`, `updated_at`

### Sessions
- `id`, `user_id`, `token`, `created_at`, `expires_at`

### Documents
- `id`, `user_id`, `filename`, `file_path`, `content`, `upload_date`

### ExamQuestions
- `id`, `user_id`, `document_id`, `question_text`, `language`, `difficulty_marks`, `created_at`

### ExamAnswers
- `id`, `exam_question_id`, `ai_response`, `tags`, `created_at`

## 🧪 Testing

### Manual Testing Flow
1. Sign up with new username/password
2. Upload a test document (TXT file works best)
3. Ask a question with different languages and difficulty levels
4. View the AI response with tags
5. Check history to see past outputs
6. Try different features

### API Testing (with curl)
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Ask question (with token)
curl -X POST http://localhost:5000/api/questions/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question":"What is photosynthesis?","language":"English","difficulty_marks":5}'
```

## ⚙️ Configuration

Edit `app/config.py` to modify:
- Database location
- Upload folder
- Max file size
- Session expiration time

## 🔐 Security Notes

- Passwords are hashed using Werkzeug security
- Session tokens are cryptographically secure
- CORS enabled for localhost (modify for production)
- Uploaded files are stored locally with user ID prefix
- All API endpoints require authentication (except signup/login)

## 🚨 Production Deployment

Before deploying to production:

1. Change `SECRET_KEY` in `app/config.py`
2. Set `debug=False` in `run.py`
3. Use a production database (PostgreSQL recommended)
4. Configure CORS properly
5. Use HTTPS
6. Implement file size validation
7. Add rate limiting
8. Set up proper logging

## 📝 Notes

- Mock AI responses are used for MVP (can integrate real AI APIs)
- SQLite is suitable for development/testing
- Single-machine deployment
- No authentication required for signup (can add email verification)

## 📧 Support

For issues or questions, please refer to the API documentation above or check the browser console for error messages.

---

**Happy Studying! 🎓**
