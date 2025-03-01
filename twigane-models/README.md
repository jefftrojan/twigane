# Twigane Learning Platform API

A FastAPI-based backend service for the Twigane Learning Platform, providing educational services with a focus on English-Kinyarwanda translation and learning assistance.

## Features

- User authentication and authorization
- Essay analysis with handwriting recognition
- Real-time chat with AI assistance
- Text-to-Speech capabilities
- Emotion analysis
- Content management
- Progress tracking
- Notifications system
- Internationalization support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### User Progress
- `POST /api/user/progress` - Create user progress
- `GET /api/user/progress/{user_id}` - Get user progress
- `PUT /api/user/progress/{user_id}` - Update user progress

### User Sessions
- `POST /api/user/session` - Create user session
- `GET /api/user/session/{user_id}` - Get user session
- `PUT /api/user/session/{user_id}` - Update user session

### Essay Analysis
- `POST /api/essay/analyze` - Analyze handwritten essay
  - Accepts image file
  - Returns text extraction, translation, and analysis

### Chat & Communication
- `POST /api/chat/message` - Send chat message
- `POST /api/emotion/analyze` - Analyze text emotion
- `POST /api/tts/generate` - Generate speech from text

### Content Management
- `GET /api/content/lessons` - Get available lessons
- `GET /api/content/lesson/{id}` - Get specific lesson
- `POST /api/content/lesson` - Create new lesson
- `PUT /api/content/lesson/{id}` - Update lesson
- `DELETE /api/content/lesson/{id}` - Delete lesson

### Assessment
- `POST /api/assessment/create` - Create assessment
- `GET /api/assessment/{id}` - Get assessment
- `PUT /api/assessment/{id}` - Update assessment
- `GET /api/assessment/results/{user_id}` - Get user assessment results

### Analytics
- `GET /api/analytics/user/{user_id}` - Get user analytics
- `GET /api/analytics/lesson/{lesson_id}` - Get lesson analytics
- `GET /api/analytics/overall` - Get platform analytics

### Notifications
- `GET /api/notifications/list` - Get user notifications
- `POST /api/notifications/mark-read/{notification_id}` - Mark notification as read
- `WebSocket /api/notifications/ws/{user_id}` - Real-time notifications

### Internationalization
- `GET /api/i18n/languages` - Get available languages
- `GET /api/i18n/translations/{lang_code}` - Get translations

## Setup & Installation

1. Clone the repository
```bash
git clone https://github.com/jefftrojan/twigane-backend.git
```
2. Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txT
```

4.  Set up environment variables (create .env file)
 
5. 4. Run the server
```bash
python run.py
```


## API Documentation
Once the server is running, access the API documentation at:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc