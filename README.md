# 📁 File Storage App

A secure and scalable file storage application with Google Drive integration, built with modern web technologies. This application allows users to upload, manage, and share files with robust security features and rate limiting.

## ✨ Features

- **User Authentication**
  - Secure session-based authentication
  - Google OAuth login
  - Role-based access control
  - Session management with Redis

- **File Management**
  - Upload and download files
  - File organization with folders
  - File sharing capabilities
  - Google Drive integration
  - Direct uploads from Google Drive to server

- **Security**
  - Rate limiting with Redis
  - Helmet.js for security headers
  - Secure cookie settings with SameSite policy
  - Input validation with Zod

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Caching & Sessions**: Redis
- **Authentication**: Session-based with Google OAuth
- **Security**: Helmet, CORS, Rate Limiting, CSRF Protection
- **Logging**: Winston with daily rotation
- **Email**: Nodemailer
- **Google APIs**: Google Drive integration
- **Validation**: Zod

### Frontend
- **Framework**: React
- **State Management**: React Context API
- **Styling**: Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Redis
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Muhammad-Zohaib-Malik/File-Storage
   cd File-Storage
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd client
   npm install
   ```

3. **Environment Setup**
   
   #### Server (.env)
   Create a `.env` file in the server directory:
   ```env
   # Server
   PORT=4000
   
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # Redis
   REDIS_PASSWORD=your_redis_password
   
   # Session & Cookies
   COOKIE_PARSER_SECRET=your_cookie_secret
   
   # SMTP Configuration
   SMTP_SERVICE=gmail
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_API_KEY=your_google_api_key
   ```
   
   #### Client (.env)
   Create a `.env` file in the client directory:
   ```env
   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_API_KEY=your_google_api_key
   VITE_SCOPE=https://www.googleapis.com/auth/drive.readonly
   ```
   
   > **Note**: Replace all placeholder values with your actual configuration. Never commit the `.env` file to version control.

4. **Start the development servers**
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend development server (in a new terminal)
   cd client
   npm start
   ```

## 🔌 Google Drive Integration

The application provides seamless integration with Google Drive, allowing users to:

- Browse and select files from their Google Drive
- Upload files from Drive to the application
- Manage permissions and sharing
- View file metadata and previews

### How to set up Google Drive API:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 credentials
6. Download the credentials and add them to your `.env` file


## 📊 Logging

Application logs are stored in the `logs` directory with daily rotation and retention of 14 days.

## 🚀 Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/Muhammad-Zohaib-Malik/File-Storage.git
   cd File-Storage
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Start both servers
   npm run dev
   ```

2. **Set up environment variables** as described above

3. **Start the application**
   ```bash
   # In separate terminals
   cd server && npm run dev
   cd client && npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


<div align="center">
  Made with ❤️ and JavaScript
</div>
