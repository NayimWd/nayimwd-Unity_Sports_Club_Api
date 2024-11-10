# Cricket Club Management System

A web application for managing local cricket tournaments and matches, built for

 # [Unity Sports Club]()

 - [Live LInk]()

 - [Repository Link](https://github.com/your-username/cricket-club-management)

 - [Model link](https://app.eraser.io/workspace/mmVyA4wj6gLlSyfu72of?origin=share) 

 - [Doc Link](http://localhost:5000/api-docs)


 This app simplifies tournament organization, team
registrations, match scheduling, and score tracking.

## Table of Contents

 - Project Overview 

 - Features 

 - Tech Stack 
 
 - Installation 

 - Usage API Documentation
 
 - Database Schema 
  
  - Project Overview

The Cricket Club Management System provides an all-in-one solution for cricket
club organizers and managers to streamline tournament creation, team
registration, match scheduling, and score tracking. The application supports
knockout tournaments and 1-on-1 friendly matches, offering a simple yet robust
interface for administrators, team managers, players, and umpires.

## Features

- Tournament Management Create knockout tournaments or 1-on-1 match series.
Schedule matches with predefined dates, times, and venues. Automatic conflict
checking for venue bookings.

- Team and Player Management Team registration with a designated manager and a
roster of up to 18 players. Each team application is tracked and reviewed for
tournament inclusion. Player profiles with statistics (runs, wickets, awards,
etc.).

- Match Scheduling and Tracking Flexible match scheduling with team assignments
and umpire allocations. Score tracking for matches, including team scores,
player stats, and results. Basic scorecards for upcoming, live, and past
matches.

- Awards and Achievements Track individual awards like “Man of the Match” and “Man of the Tournament.” 

## Tech Stack

- Frontend: React.js [live link]()

 ### Backend: 

 - Node.js

- Express.js 

- TypeScript 
 
### Database:
- MongoDB
with Mongoose ORM Payment 

### Gateway: 
- Stripe (for tournament entry fees) 

### Image
- Storage: Cloudinary 

### Installation Clone the Repository

git clone https://github.com/your-username/cricket-club-management.git cd
cricket-club-management Install Dependencies

For backend, 

run: npm install 

Environment Variables

Create a .env file in the root directory and add the following:

DATABASE_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your-database
PORT=5000 JWT_SECRET=your_jwt_secret STRIPE_SECRET_KEY=your_stripe_secret_key

### Run the Application 

npm run dev

### Usage Admin Panel:

- Create tournaments, manage teams and player registrations.

- Team Managers: Register teams, add players, and track match schedules.
 - Players: View personal stats and upcoming matches. 
 
 - Umpires: Access assigned matches and
related details.

### Data Model
- [Model link](https://app.eraser.io/workspace/mmVyA4wj6gLlSyfu72of?origin=share) 

API Documentation To view the API documentation, start the server and access:

- [Doc Link](http://localhost:5000/api-docs)

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

### Email
 **nayim.wd@gmail.com**
 ##
### Linkedin

**[Linkedin](https://www.linkedin.com/in/nayim-hasan/)**
