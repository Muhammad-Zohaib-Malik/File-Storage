# 📁 File Storage App

A secure and scalable file storage application with AWS S3 and CloudFront integration, built with modern web technologies. This application allows users to upload, manage, and share files with robust security features and rate limiting.

## 📑 Table of Contents
- [✨ Features](#-features-1)
- [🛠️ Tech Stack](#-tech-stack-1)
  - [Backend](#backend)
  - [Frontend](#frontend-1)
- [🚀 Getting Started](#-getting-started-1)
  - [Prerequisites](#prerequisites-1)
  - [Installation](#installation-1)
  - [Environment Setup](#environment-setup-1)

## ✨ Features

- **User Authentication**
  - Secure session-based authentication
  - Role-based access control
  - Session management with Redis

- **File Management**
  - Upload and download files
  - File organization with folders
  - File sharing capabilities (using email)
  - AWS S3 storage with CloudFront CDN

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
- **Authentication**: Session-based
- **Security**: Helmet, CORS, Rate Limiting, CSRF Protection
- **Logging**: Winston with daily rotation
- **Email**: Nodemailer
- **Storage**: AWS S3 with CloudFront CDN
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
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   CLOUDFRONT_DOMAIN=your_cloudfront_domain
   CLOUDFRONT_PRIVATE_KEY=
   ```
   
   #### Client (.env)
   Create a `.env` file in the client directory:
   VITE_GOOGLE_CLIENT_ID=
   ```env
  
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

## 📊 Logging

Application logs are stored in the `logs` directory with daily rotation and retention of 14 days.

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
