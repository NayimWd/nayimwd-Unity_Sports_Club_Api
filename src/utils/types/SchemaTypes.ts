import mongoose, { Document } from "mongoose";

// user type
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "admin" | "staff" | "player" | "manager" | "umpire";
  photo: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  // methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  generateResetPasswordToken(): string;
}

// player profile type
export interface IPlayerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  player_role: "batsman" | "bowler" | "all-rounder" | "wk-batsman";
  batingStyle: "right hand" | "left hand";
  bowlingArm: "left arm" | "right arm";
  bowlingStyle: "fast" | "spin" | "swing" | "seam";
  DateOfBirth: Date;
  photo?: mongoose.Types.ObjectId
}

// manager profile type
export interface IManagerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  teamsManaged: [type: mongoose.Types.ObjectId];
  photo?: mongoose.Types.ObjectId
}

// umpire Profile type
export interface IUmpireProfile extends Document {
  userId: mongoose.Types.ObjectId;
  yearsOfExperience: number;
  photo?: mongoose.Types.ObjectId
}

// team type
export interface ITeams extends Document {
  teamName: string;
  managerId: mongoose.Types.ObjectId;
  playerCount: number;
  status: "active" | "disqualified";
  teamLogo?: string;
}

export interface ITeamPlayer extends Document {
  teamId: mongoose.Types.ObjectId,
  playerId: mongoose.Types.ObjectId,
  isCaptain?: boolean,
  status: "active" | "benched" | "injured"
}

// venue type
export interface IVenue extends Document {
  name: string;
  city: string;
  location: string;
  features: "outdoor" | "indoor" | "floodlight";
  photo: string;
}

// venue booking type
export interface IVenueBooking extends Document {
  venueId: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  bookingDate: string;
  startTime: string;
  endTime: string;
 
}

// tournament type
export interface ITournament extends Document {
  tournamentName: string;
  tournamentType: "knockout" | "series" | "1v1" | "points";
  description: string;
  format: 4 | 6 | 8 | 12 | 16;
  ballType: "tape tennis" | "3 star" | "leather";
  matchOver: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  seats: number;
  teamCount: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  entryFee: number;
    champion: string;
    runnerUp: string;
    thirdPlace: string;

  photo?: string;
}

// tournamentResult
export interface ITournamentResult extends Document {
  tournamentId: mongoose.Types.ObjectId;
  result: {
    champion: mongoose.Types.ObjectId;
    runnerUp: mongoose.Types.ObjectId;
    thirdPlace: mongoose.Types.ObjectId;
  };
  manOfTheTournament?: mongoose.Types.ObjectId;
  awardFor: string;
  photo?: string;
}

// schedule type
export interface ISchedule extends Document {
  tournamentId: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  matchNumber: number;
  round: "round 1" | "round 2" | "Quarter-Final" | "Semi-Final" | "Final" | "Playoff";
  teams: {
    teamA: { type: mongoose.Types.ObjectId },
    teamB: { type: mongoose.Types.ObjectId },
  };
  previousMatches: {
    matchA: { type: mongoose.Types.ObjectId },
    matchB: { type: mongoose.Types.ObjectId },
  };
  matchDate: string;
  matchTime: string;
  status: "scheduled" | "rescheduled" | "in-progress" | "cancelled" | "completed";
}

// registration type
export interface IRegistration extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  applicationDate?: Date;
  comments?: string;
  status?: "pending" | "approved" | "rejected" | "withdrawn";
}

// innings type
export interface IInningType extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  runs: number;
  wicket: number;
  overs: number;
  extras: {
    wide: number;
    noBalls: number;
    byes: number;
    totalExtras: number;
  };
  wickets: number;
  run: number;
  totalRuns: number;
}

// match type
export interface IMatchTeype extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teams: mongoose.Types.ObjectId[]; 
  date: string;
  time: string;
  venue: mongoose.Types.ObjectId;
  status: "upcoming" | "live" | "completed";
  umpires: mongoose.Types.ObjectId[]; 
  photo: string; 
}

// match result type
export interface IMatchResult extends Document {
  tournamentId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  winner: mongoose.Types.ObjectId;
  defeated: mongoose.Types.ObjectId;
  margin: string;
  method: "normal" | "DLS" | "tie" | "no result" | "super over";
  manOfTheMatch: mongoose.Types.ObjectId;
}

// point table type
export interface IPoint extends Document {
  tournameId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  matchPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  points: number;
}

// Blog type
export interface IBlog extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: "news" | "highlight" | "tournaments" | "awards";
  createdAt: Date;
  likes?: number;
  comments?: [user: mongoose.Types.ObjectId, comment: string, date: Date];
  isPublished: boolean;
}
