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
  batingStyle: "Right Hand" | "Left Hand";
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
  bookingDate: Date;
  startTime: string;
  endTime: string;
 
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
  seats: "16" | "8" | "2" | "3";
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
  matchId?: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  matchNumber: number;
  round: "round 1" | "Quarter-Final" | "Semi-Final" | "Final";
  teams: [
    teamA: { type: mongoose.Types.ObjectId },
    teamB: { type: mongoose.Types.ObjectId },
  ];
  date: Date;
  startTime: string;
  status: "scheduled" | "cancelled" | "completed";
  matchResult?: mongoose.Types.ObjectId;
}

// registration type
export interface IRegistration extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamtId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  applicationDate?: Date;
  comments?: string;
  status?: "pending" | "approve" | "rejected" | "withdrawn";
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
}

// match type
export interface IMatchTeype extends Document {
  tournamentId: mongoose.Types.ObjectId;
  matchType: "knockout" | "series" | "1v1";
  teams: [
    teamA: { type: mongoose.Types.ObjectId },
    teamB: { type: mongoose.Types.ObjectId },
  ];
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
