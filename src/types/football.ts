export enum Country {
  Spain = "Spain",
  England = "England",
  Germany = "Germany",
  France = "France",
  Italy = "Italy",
  Netherlands = "Netherlands",
  Portugal = "Portugal"
}

export enum ClubStatus {
  Active = "Active",
  Rebuilding = "Rebuilding",
  Champion = "Champion"
}

export enum Competition {
  ChampionsLeague = "Champions League",
  EuropaLeague = "Europa League",
  PremierLeague = "Premier League",
  LaLiga = "La Liga",
  Bundesliga = "Bundesliga",
  SerieA = "Serie A",
  Ligue1 = "Ligue 1",
  Eredivisie = "Eredivisie"
}

export enum MatchStatus {
  Scheduled = "Scheduled",
  Played = "Played"
}

export interface Club {
  id: number;
  name: string;
  country: Country;
  city: string;
  league: string;
  stadium: string;
  foundedYear: number;
  coach: string;
  valueMillions: number;
  europeanTitles: number;
  status: ClubStatus;
}

export interface NewClub {
  name: string;
  country: Country;
  city: string;
  league: string;
  stadium: string;
  foundedYear: number;
  coach: string;
  valueMillions: number;
  europeanTitles: number;
  status: ClubStatus;
}

export interface Match {
  id: number;
  homeClubId: number;
  awayClubId: number;
  competition: Competition;
  date: string;
  venue: string;
  homeGoals: number;
  awayGoals: number;
  status: MatchStatus;
  importance: number;
}

export interface NewMatch {
  homeClubId: number;
  awayClubId: number;
  competition: Competition;
  date: string;
  venue: string;
  homeGoals: number;
  awayGoals: number;
  status: MatchStatus;
  importance: number;
}

export interface FieldErrors {
  [fieldName: string]: string;
}

export interface MatchWithClubs extends Match {
  homeClubName: string;
  awayClubName: string;
}
