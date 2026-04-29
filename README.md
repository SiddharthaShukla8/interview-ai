<div align="center">
  <h1>🚀 Interview AI</h1>
  <p><strong>Your Ultimate AI-Powered Interview Preparation Companion</strong></p>
</div>

## 🌟 Overview

**Interview AI** is a cutting-edge, full-stack web application designed to help job seekers prepare for interviews with confidence. By leveraging advanced Google Gemini AI models, the platform generates tailored interview questions based on user resumes, industry roles, and experience levels.

Whether you're practicing behavioral questions or deep technical concepts, Interview AI provides a realistic, dynamic, and fully personalized interview experience.

## ✨ Key Features

- **🧠 AI-Powered Interviews**: Generates contextual and role-specific interview questions using Google's Gemini AI.
- **📄 Resume Parsing**: Upload your resume (PDF) and let the system automatically extract context to tailor your interview.
- **🔐 Secure Authentication**: Robust user authentication system with both traditional Email/Password and **Google OAuth 2.0** integration.
- **📄 PDF Report Generation**: Automatically generates detailed PDF reports of your interview sessions for offline review.
- **🎨 Modern UI/UX**: Highly responsive, beautiful interface built with React, TailwindCSS, and Framer Motion for smooth animations.
- **🛡️ Secure & Scalable**: Backend built with Express.js, featuring rate limiting, Helmet for security, and JWT-based session management.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4, SASS
- **Animations**: Framer Motion
- **Routing**: React Router v7
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: `@google/genai` (Google Gemini)
- **Authentication**: Passport.js (Google OAuth20), JWT, bcryptjs
- **File Processing**: Multer (Uploads), pdf-parse (Reading PDFs)
- **Document Generation**: Puppeteer
- **Validation**: Zod

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- Google Gemini API Key
- Google OAuth Credentials (Client ID & Secret)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SiddharthaShukla8/interview-ai.git
   cd interview-ai
   ```

2. **Backend Setup:**
   ```bash
   cd Backend
   npm install
   ```
   Create a `.env` file in the `Backend` directory and configure the necessary environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   FRONTEND_URL=http://localhost:5173
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../Frontend
   npm install
   ```
   Create a `.env` file in the `Frontend` directory if required by your setup (e.g., for API URLs).
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open the Application:**
   Navigate to `http://localhost:5173` in your browser.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project, feel free to fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.
