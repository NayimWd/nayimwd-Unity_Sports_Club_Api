# 🏏 Cricket Club Management System

> **The backend of a fullstack cricket tournament management app — built to solve a real local problem for Unity Sports Club.**  
> My first API, built with one philosophy: *learn by building something that actually matters. No shortcuts.*

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

🔗 **Live API** → [Railway Deployment](https://nayimwd-unitysportsclubapi-production.up.railway.app/api/v1)
🔗 **API Docs** → [Swagger UI](https://nayimwd-unitysportsclubapi-production.up.railway.app/api-docs/)
🔗 **Data Model** → [Google Drive](https://drive.google.com/file/d/1DgaWpyFdYuJjKmeVMf8zARfbjvqLuZwq/view?usp=sharing)
🔗 **Repository** → [GitHub](https://github.com/your-username/cricket-club-management)

---

## 📖 Table of Contents

- [The Story Behind It](#-the-story-behind-it)
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [What I Learned](#-what-i-learned)
- [Honest Mistakes & Lessons](#-honest-mistakes--lessons)
- [Architecture Decision](#-architecture-decision)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [What's Next](#-whats-next)
- [Contact](#-contact)

---

## 🌱 The Story Behind It

About two years ago, **[HM Nayim](https://www.linkedin.com/in/mrhm/)** — one of the most followed tech voices in Bangladesh — posted a project idea on LinkedIn with a simple challenge:

> *"Build this fullstack app and you're ready to get a job."*  
> — [See the original post →](https://www.linkedin.com/posts/mrhm_%E0%A6%86%E0%A6%9C%E0%A6%95-%E0%A6%AF%E0%A6%87-%E0%A6%AA%E0%A6%B0%E0%A6%9C%E0%A6%95%E0%A6%9F-%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%AF-%E0%A6%A8%E0%A6%AF-%E0%A6%95%E0%A6%A5-%E0%A6%AC%E0%A6%B2%E0%A6%AC-activity-7204345017023254528-UYRw)

I took that challenge — alongside my studies and a part-time job.

But I didn't want to just *ship* something. I made a deliberate choice: **learn first, build second.** No jumping ahead with AI-generated code. No copy-pasting solutions I didn't understand. Topic by topic, concept by concept — which is why it took a long time. And that's exactly why every part of this codebase actually makes sense to me.

I didn't want to build a to-do app. I wanted to solve a **real problem I could see around me**. Local cricket tournaments in my area had no structured management — schedules were communicated informally, team registrations were messy, and there was no single place for players, managers, and umpires to track anything. So I picked that as my problem.

This repository is the **backend** of what will be a complete fullstack application. The API is live. The frontend is currently in progress — built with React.js(dashboard for management) and Next.js(public site). This README covers the backend system in full.

This project is the result of me going from *"what is a REST API?"* to shipping a **110+ endpoint production system** with role-based auth, Redis caching, file uploads, API timeouts, structured logging, and full Swagger documentation — entirely from scratch, on my own time, while working and studying.

It's not perfect. But it's mine, and every line of code taught me something.

---

## 📌 Overview

The **Cricket Club Management System** is a RESTful backend API designed for clubs, tournament organizers, managers, players, and umpires to collaborate on a single platform.

**Core capabilities:**
- 🏆 Tournament creation — knockout & friendly formats
- 👥 Team & player registration with approval workflows
- 📅 Match scheduling with venue conflict detection
- 📊 Scorecard tracking & live point tables
- 🎖️ Awards tracking (Man of the Match, Man of the Tournament)
- 🔐 5-role authentication system (Admin, Staff, Manager, Player, Umpire)

---

## ✨ Features

### 🏟️ Tournament Management
- Create knockout tournaments or friendly series with custom schedules
- Define registration deadlines, entry fees (Stripe integration), and venues
- Automatic conflict detection to prevent double-booking venues

### 👥 Team & Player Management
- Register teams with a designated manager and up to 18 players
- Admin-controlled approval/rejection of team applications
- Player profiles with stats, award history, and tournament participation

### 📅 Match Scheduling & Tracking
- Flexible scheduling with umpire allocation per match
- Track upcoming, live, and completed matches
- Scorecards with team and player-level score entries

### 🔐 Role-Based Access Control
- Five distinct roles: **Admin**, **Staff**, **Manager**, **Player**, **Umpire**
- JWT-based authentication with bcrypt password hashing
- Middleware-enforced route protection per role

### ⚙️ Performance & Reliability
- **Redis caching** on high-read endpoints to reduce DB load
- **API timeout middleware** to prevent hanging requests
- **Structured logging** with pino for traceability
- **Pagination, filtering, sorting, and search** across major resources
- **Lean queries** and selective field projection for optimized DB reads

### 📁 File Handling
- Profile image uploads via **Multer → Cloudinary**

### 📄 API Documentation
- Full **Swagger UI** documentation
- Postman collection available

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript (entire project) |
| Database | MongoDB + Mongoose |
| Caching | Redis |
| Auth | JWT + Bcrypt |
| File Storage | Multer + Cloudinary |
| Payments | Stripe |
| Logging | pino |
| API Docs | Swagger + Postman |
| Deployment | Railway |

---

## 🧠 What I Learned

This project was a deliberate learning exercise. Here's what I genuinely picked up by building it:

**Database & Data Modeling**
- Designed MongoDB schemas from scratch — relationships, references, embedding tradeoffs
- Learned population (joins in Mongo), data projection, and when *not* to over-fetch
- Applied `.lean()`, selective field projection, and query optimization to reduce unnecessary overhead
- Implemented pagination, search, sort, and filter across multiple resources

**Auth & Security**
- Built a 5-role authentication system end-to-end using JWT and bcrypt
- Wrote custom middleware for route-level role enforcement

**Architecture & Code Quality**
- Layered architecture: routes → controllers → services → models
- Global error handler, unified response formatter, and async handler wrapper
- TypeScript throughout — interfaces, types, strict config
- API timeout middleware to handle slow or stuck requests
- Redis caching middleware integrated on read-heavy endpoints
- Structured logging with pino for production-level traceability
- Feature-based routing (even within a layered architecture)

**Tooling & Workflow**
- Swagger UI documentation from scratch (110+ endpoints)
- File upload pipeline: Multer → Cloudinary
- Git branching, PR workflow, merging — practiced consistently
- Deployed to Railway; understand Render and similar PaaS platforms

**Requirement Analysis**
- Analyzed a real-world problem, identified stakeholders (5 roles), mapped out entities and their relationships before writing a single line of code
- Handled business logic edge cases: venue conflict detection, registration deadlines, score ownership, umpire assignment rules

---

## 🪞 Honest Mistakes & Lessons

I believe in transparency. Here are the real mistakes I made — because they're what actually taught me the most:

### 1. Wrong Architecture Choice
I chose a **layered architecture** (routes/controllers/models separated by type) for a project that eventually grew to 110+ endpoints. About 80% through, I learned about **feature-based architecture** (grouping by domain: `tournament/`, `match/`, `player/`) and immediately understood why it would have been better here.

In a layered architecture at this scale, I found myself constantly jumping between folders to trace a single feature. It slowed me down and made the codebase harder to reason about.

**Lesson**: Architecture decisions made at the start have compounding consequences. For any project beyond ~30 endpoints, feature-based architecture is likely the better default.

### 2. Storing Dates as Strings
During early development, Postman wasn't accepting date inputs correctly in my setup. As a quick fix, I stored dates as strings. This cascaded into a bigger problem — I eventually had to build a **custom date converter utility** just to compare dates reliably.

**Lesson**: Never compromise on data types for convenience. Fix the tooling issue, not the data model.

### 3. Inconsistent API Endpoint Naming
Some endpoints ended up with inconsistent naming conventions — mixing patterns, unclear resource names in a few places. I only noticed it after the structure was set and refactoring was expensive.

**Lesson**: Define an API naming convention (noun-based, plural resources, consistent versioning) before writing the first route. It's nearly free to do upfront and very expensive to fix later.

---

## 🏗️ Architecture Decision

This project uses a **Layered Architecture**:
```
routes/ → controllers/ → models/
```

In hindsight, a **Feature-Based Architecture** would have been more maintainable at this scale:
```
src/
├── tournament/
│   ├── tournament.routes.ts
│   ├── tournament.controller.ts
│   ├── tournament.service.ts
│   └── tournament.model.ts
├── match/
│   └── ...
```

I'm documenting this explicitly because it's a real decision future developers (or I) would face when extending this system. The current structure works — but this is the honest tradeoff.

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cricket-club-management.git
cd cricket-club-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root:
```env
# Database
DATABASE_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your-database

# Server
PORT=5000

# Auth
JWT_SECRET=your_jwt_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cache
REDIS_URL=your_redis_url
```

### 4. Run the Development Server
```bash
npm run dev
```

---

## 📄 API Documentation

**Swagger UI** is available at:
```
http://localhost:5000/api-docs
```
Or on the live deployment: [Swagger Docs →](https://nayimwd-unitysportsclubapi-production.up.railway.app/api-docs/)

The API is versioned under `/api/v1/`.

**Role access summary:**

| Role | Key Permissions |
|---|---|
| Admin | Full system access, approvals, tournament creation |
| Staff | Assist admin, manage schedules |
| Manager | Register/manage team and players |
| Player | View personal stats, match schedules |
| Umpire | Access assigned matches |

---

## 🗄️ Database Schema

MongoDB schemas designed with normalized references where relationships span multiple features, and embedded documents where data is tightly owned.

| Schema | Purpose |
|---|---|
| User | Auth credentials + role assignment |
| Profile | Extended info for managers, players, umpires |
| Team | Team composition, tournament applications |
| Tournament | Tournament metadata, deadlines, fees |
| Schedule | Match dates, times, venue assignments |
| Match | Team pairings, umpire assignments, results |
| Score | Team and player-level scoring per match |
| Venue | Venue details + conflict prevention logic |
| Registration | Team-to-tournament application tracking |
| Award | Player awards and achievements |

📐 Full diagram: [Data Model →](https://drive.google.com/file/d/1DgaWpyFdYuJjKmeVMf8zARfbjvqLuZwq/view?usp=sharing)

---

## 📂 Project Structure
```bash
├── src/
│   ├── app/                 # App initialization & global middleware
│   ├── config/              # DB, Swagger, environment config
│   ├── constants.ts         # Global constants
│   ├── controllers/         # Business logic handlers
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
│   ├── docs/                # Swagger spec files
│   ├── middleware/          # Auth, validation, timeout, Redis, multer
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers (feature-based routing)
│   └── utils/               # Helpers — types, formatters, async handler
├── .prettierrc
├── nodemon.json
├── tsconfig.json
└── package.json
```

---

## 🔭 What's Next

The backend is live. Here's what's actively in progress and on the roadmap:

**In Progress**
- **Next.js Frontend** — the other half of the fullstack challenge, currently being built with Zustand + RTK Query

**Learning & Upcoming**
- **CI/CD pipeline** — automated testing and deployment on push
- **NGINX** — reverse proxy setup and load balancing (the concept I'm most excited to go deep on)
- **Docker** — containerizing the full app; I have foundational knowledge and building further
- **Feature-based architecture** — applying this from day one on the next project
- **Consistent API design** — enforcing naming conventions via linting/tooling upfront

---

## 📬 Contact

Built by **Nayim Hasan** — a developer who believes the best way to learn is to build things that solve real problems.

📧 [nayim.wd@gmail.com](mailto:nayim.wd@gmail.com)
💼 [LinkedIn](https://www.linkedin.com/in/nayim-hasan/)

---

*If you're a senior developer reviewing this — I'd genuinely appreciate feedback on anything you'd have done differently. That's exactly the kind of input that helps me grow.*
