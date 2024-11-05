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
  generateResetPasswordToken(): Promise<string>;
}

// player profile type
export interface IPlayerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  teaamId: mongoose.Types.ObjectId;
  role: "batsman" | "bowler" | "all-rounder" | "wk batsman";
  batingStyle: "Right Hand" | "Left Hand";
  bowlingArm: "left arm" | "right arm";
  bowlingStyle: "fast" | "spin" | "swing" | "seam";
  DateOfBirth: Date;
}

// manager profile type
export interface IManagerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  teamsManaged: [string];
}

// umpire Profile type
export interface IUnpireProfile extends Document {
  userId: mongoose.Types.ObjectId;
  yearsOfExperience: number;
}

// team type
export interface ITeams extends Document {
  teamName: string;
  managerId: mongoose.Types.ObjectId;
  players: [];
  captain: mongoose.Types.ObjectId;
  photo: string;
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

// venue type
export interface IVenue extends Document {
  name: string;
  location: string;
  photo: string;
  bookingSlot: [date: Date, startTime: string, endTime: string];
}

// tournament type
export interface ITournament extends Document {
  tournamentName: string;
  tournamentType: "knockout" | "series" | "1v1";
  description: string;
  format: "8 teams" | "16 teams";
  ballType: "tape tennis" | "3 star" | "leather";
  matchOver: string;
  registrationDeadline?: Date;
  teamsRegisterd?: [];
  seats: "16" | "8" | "2" | "3";
  schedule?: [];
  startDate: Date;
  endDate: Date;
  venue: mongoose.Types.ObjectId;
  status: "upcoming" | "ongoing" | "completed";
  entryFee: number;
  prize: {
    champion: string;
    runnerUp: string;
    thirdPlace: string;
  };
  result?: {
    champion: mongoose.Types.ObjectId;
    runnerUp: mongoose.Types.ObjectId;
    thirdPlace: mongoose.Types.ObjectId;
  };
  manOfTheTournament?: mongoose.Types.ObjectId;
  photo: string;
}

// schedule type
export interface ISchedule extends Document {
  tournament: mongoose.Types.ObjectId;
  matchNumber: number;
  round: string;
  teamA?: mongoose.Types.ObjectId;
  teamB?: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  venue: mongoose.Types.ObjectId;
  status: "upcoming" | "live" | "completed";
}

// registration type
export interface IRegistration extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamtId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  applicationDate?: Date;
  comments?: string;
  status?: "pending" | "approve" | "rejected";
}

// innings type
export interface IInningType extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  runs: number;
  wicket: number;
  overs: number;
  extras?: {
    wide: number;
    noBalls: number;
    byes: number;
    totalExtras: number;
  };
}

// match result type
export interface IMatchResult extends Document {
  tournamentId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  champion: mongoose.Types.ObjectId;
  runnerUp: mongoose.Types.ObjectId;
  margin: {
    runs: number;
    wicket: number;
  };
  method: "normal" | "DLS" | "tie" | "no result";
  manOfTheMatch: mongoose.Types.ObjectId;
}

// match type
export interface IMatchTeype extends Document {
  tournamentId: mongoose.Types.ObjectId;
  matchType: "knockout" | "series" | "1v1";
  teams: [{ type: mongoose.Types.ObjectId }, { type: mongoose.Types.ObjectId }];
  date: Date;
  venue: mongoose.Types.ObjectId;
  status: "upcoming" | "live" | "completed";
  umpires: [
    {
      type: mongoose.Types.ObjectId;
    },
  ];
  matchResult?: mongoose.Types.ObjectId;
  photos: [{ type: string }];
}
