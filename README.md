# 📚 Siksha
### A Full-Stack Student Productivity Platform

🌐 **Live Demo:** [https://siksha.binarybuilds.online](https://siksha.binarybuilds.online)

> Siksha is a student-focused academic platform built to make learning more organized, collaborative, and productive. It provides a centralized space where students can access notes, manage study materials, track deadlines, and improve their learning experience through interactive tools.

---

## 📸 Screenshots

### 🔐 Login & Registration
![Login](./screenshots/login.png)

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

### 📝 Notes Section
![Notes](./screenshots/notes.png)

### 🃏 Flashcards
![Flashcards](./screenshots/flashcards.png)

### ⏱️ Study Timer
![Timer](./screenshots/timer.png)

---

## 🚀 Live Demo

🌐 [https://siksha.binarybuilds.online](https://siksha.binarybuilds.online)

---

## ✨ Features

### 📝 Notes Management
- Upload and share study notes
- View detailed note information
- Save important notes for later reference
- Search notes quickly

### 🧑‍💻 Student Dashboard
- Personalized dashboard
- Easy access to notes and academic resources
- User profile management

### ⏱️ Study Productivity Tools
- Study Timer for focused learning sessions
- Flashcards for revision and self-assessment
- Deadline tracking and reminders

### 📋 Notice Management
- Create and view academic notices
- Stay updated with important announcements

### 📂 Subject & Class Organization
- Categorize notes by subjects
- Filter content based on classes
- Better academic organization

### 🔐 Authentication & Security
- User Registration and Login
- Protected Routes
- Google OAuth 2.0 Support

### 🎨 Modern User Interface
- Responsive design for all devices
- Clean and intuitive user experience
- Mobile-friendly layout

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js
- 🔀 React Router
- 🎨 Tailwind CSS
- ⚡ Vite

### Backend
- 🟩 Node.js
- 🚂 Express.js

### Database
- 🍃 MongoDB

### Authentication
- 🔑 JWT (JSON Web Tokens)
- 🟢 Google OAuth 2.0

### Additional Tools
- 🔗 Axios
- 🐙 Git & GitHub

### Deployment
- ☁️ Frontend hosted on [Hostinger](https://hostinger.com)
- 🔄 Backend deployed on [Render](https://render.com)

---

## 🏗️ Architecture

```
React Frontend (Vite + Tailwind CSS)
         │
         ▼
   REST API (Express.js)
         │
         ▼
   MongoDB Database
```

- Frontend communicates with backend via RESTful APIs using Axios
- Backend handles authentication, CRUD operations, and business logic
- MongoDB stores user data, notes, flashcards, and deadlines

---

## 📁 Project Structure

```bash
Siksha
│
├── frontend
│   ├── components
│   ├── pages
│   ├── context
│   └── assets
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   └── middleware
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ManjeetShaw/Siksha.git
cd Siksha
```

### 2. Install Dependencies

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Run the Application

Backend:
```bash
npm run dev
```

Frontend:
```bash
npm run dev
```

---

## 🚧 Challenges Faced

- 🔐 Implementing secure JWT authentication with token refresh logic
- 🟢 Integrating Google OAuth smoothly across frontend and backend
- 🌐 Managing CORS issues during frontend-backend communication
- ☁️ Deploying frontend and backend as separate services
- 🍃 Handling MongoDB connection pooling and errors in production
- 📱 Making the UI fully responsive across all screen sizes

---

## 🔮 Future Enhancements

- 🤖 AI-powered note summarization
- 🧠 AI-generated quizzes
- 💡 Smart note recommendations
- 👥 Real-time collaboration
- 📅 Attendance tracking
- 📊 Progress analytics dashboard
- 📄 PDF note viewer
- 💬 Discussion forum for students
- 🌙 Dark mode customization

---

## 🎓 Learning Objectives

This project helped in understanding:
- React Component Architecture
- State Management using Context API
- Authentication and Authorization
- REST API Integration
- MongoDB Database Operations
- Frontend-Backend Communication
- Responsive UI Development

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Authors

**Manjeet Shaw**
- GitHub: [@ManjeetShaw](https://github.com/ManjeetShaw)
- B.Tech CSE Student

**Divya Das**
- GitHub: [@divya240918](https://github.com/divya240918)
- B.Tech CSE Student

---

## 📄 License

This project is developed for educational and learning purposes.

---

⭐ If you found this project useful, consider giving it a star on GitHub!
