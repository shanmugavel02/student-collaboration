# Student Skill & Project Collaboration Platform

A full-stack web application that helps students showcase their technical skills, create projects, discover collaboration opportunities, and manage project applications.

## About the Project

Students often find it difficult to discover teammates with the skills needed for their projects. This platform provides a common place for students to maintain their profiles, share project ideas, and collaborate with other students.

## Features

- **Student Registration and Login** — Create an account and access the platform.
- **Student Profile** — View and update profile information.
- **Skills Management** — Add and remove technical skills.
- **Project Management** — Create and view your own projects.
- **Find Projects** — Discover projects and search for collaboration opportunities.
- **Apply to Projects** — Submit applications to join projects.
- **My Applications** — View your applications and their status.
- **Manage Applications** — Review applications received for your projects.
- **MongoDB Database** — Store student, project, and application data.

## Technologies Used

### Frontend
- React.js
- Vite
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose

### Tools
- Visual Studio Code
- Git
- GitHub
- npm

## Project Structure

```text
student-collaboration/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── Dashboard.jsx
│       ├── Profile.jsx
│       ├── Skills.jsx
│       └── ...
├── backend/
│   ├── server.js
│   ├── models/
│   └── package.json
├── .gitignore
└── README.md
```

*The structure above highlights the main files. Your actual project may contain additional components and configuration files.*

## Requirements

Install the following before running the application:

- Node.js and npm
- MongoDB Community Server, running locally
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/shanmugavel02/student-collaboration.git
cd student-collaboration
```

### 2. Start the backend

Open a terminal in the project folder and run:

```bash
cd backend
npm install
node server.js
```

The backend should run at:

`http://localhost:5000`

Make sure MongoDB is running before starting the backend.

### 3. Start the frontend

Open a **second terminal** in the project folder and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## How to Use

1. Register a student account.
2. Log in to the platform.
3. Update your profile and technical skills.
4. Create and manage projects.
5. Find projects and apply to join them.
6. Review your applications and manage applications received for your projects.

## Future Enhancements

- Deploy the application online.
- Improve authentication and password security.
- Add notifications for application updates.
- Enable project team management.
- Improve search and filtering.
- Add automated tests and stronger input validation.

## Project Status

The core application features have been implemented. Further improvements, testing, security enhancements, and deployment are planned.

## Author

**Shanmugavel K**

GitHub: [@shanmugavel02](https://github.com/shanmugavel02)

---

This project was developed as a full-stack web development learning project.
