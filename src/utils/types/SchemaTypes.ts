import mongoose, { Document, Types } from "mongoose";

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
  userId: Types.ObjectId;
  teamId: Types.ObjectId;
  player_role: "batsman" | "bowler" | "all-rounder" | "wk-batsman";
  batingStyle: "right hand" | "left hand";
  bowlingArm: "left arm" | "right arm";
  bowlingStyle: "fast" | "spin" | "swing" | "seam";
  DateOfBirth: Date;
  photo?: Types.ObjectId
}

// manager profile type
export interface IManagerProfile extends Document {
  userId: Types.ObjectId;
  teamsManaged: [type: Types.ObjectId];
  photo?: Types.ObjectId
}

// umpire Profile type
export interface IUmpireProfile extends Document {
  userId: Types.ObjectId;
  yearsOfExperience: number;
  photo?: Types.ObjectId
}

// team type
export interface ITeams extends Document {
  teamName: string;
  managerId: Types.ObjectId;
  playerCount: number;
  status: "active" | "disqualified";
  teamLogo?: string;
}

export interface ITeamPlayer extends Document {
  teamId: Types.ObjectId,
  playerId: Types.ObjectId,
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
  venueId: Types.ObjectId;
  bookedBy: Types.ObjectId;
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
  tournamentId: Types.ObjectId;
  result: {
    champion: Types.ObjectId;
    runnerUp: Types.ObjectId;
    thirdPlace: Types.ObjectId;
  };
  manOfTheTournament?: Types.ObjectId;
  awardFor: string;
  photo?: string;
}

// schedule type
export interface ISchedule extends Document {
  tournamentId: Types.ObjectId;
  matchId: Types.ObjectId;
  venueId: Types.ObjectId;
  matchNumber: number;
  round: "round 1" | "round 2" | "Quarter-Final" | "Semi-Final" | "Final" | "Playoff";
  teams: {
    teamA: { type: Types.ObjectId },
    teamB: { type: Types.ObjectId },
  };
  previousMatches: {
    matchA: { type: Types.ObjectId },
    matchB: { type: Types.ObjectId },
  };
  matchDate: string;
  matchTime: string;
  status: "scheduled" | "rescheduled" | "in-progress" | "cancelled" | "completed";
}

// registration type
export interface IRegistration extends Document {
  tournamentId: Types.ObjectId;
  teamId: Types.ObjectId;
  managerId: Types.ObjectId;
  applicationDate?: Date;
  comments?: string;
  status?: "pending" | "approved" | "rejected" | "withdrawn";
}

// innings type
export interface IInningType extends Document {
  tournamentId: Types.ObjectId;
  teamId: Types.ObjectId;
  matchId: Types.ObjectId;
  inningsNumber: 1 | 2;
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
interface PreviousMatches {
  matchA?: Types.ObjectId;
  matchB?: Types.ObjectId;
}

interface Umpires {
  firstUmpire?: Types.ObjectId;
  secondUmpire?: Types.ObjectId;
  thirdUmpire?: Types.ObjectId;
}

export interface IMatch {
  tournamentId: Types.ObjectId;
  matchNumber: number;
  teamA?: Types.ObjectId;
  teamB?: Types.ObjectId;
  previousMatches?: PreviousMatches; 
  status: "upcoming" | "scheduled" | "in-progress" | "completed" | "cancelled";
  umpires: Umpires; 
  photo?: string;
}

export interface IPlayingSquad {
  tournamentId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[]; // Exactly 11 players
  captain: mongoose.Types.ObjectId;
  wicketKeeper: mongoose.Types.ObjectId;
}

// match result type
export interface IMatchResult extends Document {
  tournamentId: Types.ObjectId;
  matchId: Types.ObjectId;
  winner: Types.ObjectId;
  defeated: Types.ObjectId;
  margin: string;
  method: "normal" | "DLS" | "tie" | "no result" | "super over";
  manOfTheMatch: Types.ObjectId;
  matchReport: string;
  photo?: string;
}

// point table type
export interface IPoint extends Document {
  tournamentId: Types.ObjectId;
  teamId: Types.ObjectId;
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
  author: Types.ObjectId;
  tags: "news" | "highlight" | "tournaments" | "awards";
  createdAt: Date;
  likes?: number;
  comments?: [user: Types.ObjectId, comment: string, date: Date];
  isPublished: boolean;
}
