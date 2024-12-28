# Multilingual Chat Application

A real-time chat application with admin dashboard supporting English, Myanmar, and Thai languages.

## Features

- Multi-language support (English, Myanmar, Thai)
- Admin Dashboard
- Real-time chat using Supabase
- User management
- Chat room management

## Tech Stack

- React.js
- Supabase
- Material-UI
- Docker
- i18next for translations

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Build with Docker:
   ```bash
   docker build -t multilingual-chat-app .
   docker run -p 3000:3000 multilingual-chat-app
   ```

## Supabase Setup

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Create chat rooms table
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES users (id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms (id),
  sender_id UUID REFERENCES users (id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App
