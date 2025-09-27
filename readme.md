# 🏏 Cricket Club Management System  

A modern web application to **organize and manage local cricket tournaments, matches, and teams**, built for **[Unity Sports Club]()**.  

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)  
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)  
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)  

🔗 **Live API** → [Railway Deployment](https://nayimwd-unitysportsclubapi-production.up.railway.app/api/v1)  
🔗 **Repository** → [GitHub](https://github.com/your-username/cricket-club-management)  
🔗 **Data Model** → [Eraser Diagram](https://app.eraser.io/workspace/mmVyA4wj6gLlSyfu72of?origin=share)  
🔗 **API Docs** → [Swagger UI](https://nayimwd-unitysportsclubapi-production.up.railway.app/api-docs/)  

---

## 📖 Table of Contents  
- [Overview](#-overview)  
- [Features](#-features)  
- [Tech Stack](#-tech-stack)  
- [Installation](#-installation)  
- [Usage](#-usage)  
- [Database Schema](#-database-schema)  
- [Project Structure](#-project-structure)  
- [License](#-license)  
- [Contact](#-contact)  

---

## 📌 Overview  

The **Cricket Club Management System** is designed for **clubs, managers, and tournament organizers** to streamline:  
- 🏆 Tournament creation (knockout & friendly matches)  
- 👥 Team and player registration  
- 📅 Match scheduling with venue conflict detection  
- 📊 Score tracking and point tables  
- 🎖️ Awards & achievements tracking  

This provides a **single platform** for admins, managers, players, and umpires to collaborate effectively.  

---

## ✨ Features  

### 🏟️ Tournament Management  
- Create knockout tournaments or friendly series  
- Define schedules (dates, times, venues)  
- Automatic conflict checks for venue availability  

### 👥 Team & Player Management  
- Register teams with a manager & up to 18 players  
- Approve/reject team applications  
- Player profiles (basic stats, awards, participation)  

### 📅 Match Scheduling & Tracking  
- Flexible match scheduling with umpire allocations  
- Track live, upcoming, and past matches  
- Basic scorecards & results  

### 🎖️ Awards  
- Track awards like *“Man of the Match”* & *“Man of the Tournament”*  

---

## 🛠️ Tech Stack  

**Frontend**: React.js (planned with Next.js, Zustand, RTK Query)  

**Backend**:  
- Node.js + Express.js  
- TypeScript  

**Database**:  
- MongoDB (Mongoose ORM)  

**Other Integrations**:  
- Cloudinary → Image storage  
- Stripe → Tournament entry fees  
- Swagger → API documentation  

---

## ⚙️ Installation  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/cricket-club-management.git
cd cricket-club-management


Install Dependencies

For backend, 

run: npm install 

Environment Variables

Create a .env file in the root directory and add the following:

DATABASE_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your-database
PORT=5000 JWT_SECRET=your_jwt_secret STRIPE_SECRET_KEY=your_stripe_secret_key

### Run the Application 

npm run dev
```
### Usage Admin Panel:

- Create tournaments, manage teams and player registrations.

- Team Managers: Register teams, add players, and track match schedules.
 - Players: View personal stats and upcoming matches. 
 
 - Umpires: Access assigned matches and
related details.

### Data Model
- [Model link](https://app.eraser.io/workspace/mmVyA4wj6gLlSyfu72of?origin=share) 

API Documentation To view the API documentation, start the server and access:

- [Doc Link](https://nayimwd-unitysportsclubapi-production.up.railway.app/api-docs/)

This documentation includes detailed descriptions of each endpoint, request
parameters, and response examples.

## Database Schema

### The project’s MongoDB schema includes:

- User Schema: Manages admin, staff, manager, player, and umpire roles. 

- Profile Schema: Holds detailed information for managers, players, and umpires.

- Team Schema: Manages team composition and tournament applications. 
 
- Tournament Schema:
Organizes tournament details, registration deadlines, and fees.

- Schedule Schema:
Manages match dates, times, and venue availability. 

- Match Schema: Records team
pairings, umpire assignments, and results.
 
- Score Schema: Tracks team and player
scores during matches. 

- Venue Schema: Holds venue details and prevents booking
conflicts. 

- Registration Schema: Manages team applications to tournaments. 

- Award
Schema: Records player awards and achievements.

License This project is licensed under the MIT License.

Thank you for checking out this project! If you have any questions or feedback, feel free to open an issue or contact me. 

## 📂 Project Structure
The following is the core structure of the project.  

Each folder is organized by responsibility to keep the codebase modular, scalable, and easy to maintain. 

```bash
├── .gitignore
├── .prettierrc              # Prettier config
├── nodemon.json             # Dev server config
├── package.json
├── public/                  # Static assets
├── readme.md
├── src/
│   ├── app/                 # App initialization & middleware
│   ├── config/              # DB, Swagger, Env config
│   ├── constants.ts         # Global constants
│   ├── controllers/         # Business logic
│   │   ├── blogs/
│   │   ├── matches/
│   │   ├── players/
│   │   ├── pointTable/
│   │   ├── profiles/
│   │   ├── registration/
│   │   ├── schedule/
│   │   ├── teams/
│   │   ├── tournaments/
│   │   ├── users/
│   │   └── venues/
│   ├── db/                  # MongoDB connection
│   ├── docs/                # Swagger API docs
│   ├── middleware/          # Auth, validation, multer, etc.
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   └── utils/               # Helpers (types, formatters, etc.)
├── tsconfig.json
└── tsconfig.build.json
```

### Email
 **nayim.wd@gmail.com**
 ##

### Linkedin
**[Linkedin](https://www.linkedin.com/in/nayim-hasan/)**
