import { ClubStatus, Competition, Country, MatchStatus, type FieldErrors, type NewClub, type NewMatch } from "../types/football";

function getText(formData: FormData, fieldName: string): string {
  return String(formData.get(fieldName) ?? "").trim();
}

function getNumber(formData: FormData, fieldName: string): number {
  return Number(getText(formData, fieldName));
}

function isEnumValue<T extends Record<string, string>>(enumObject: T, value: string): value is T[keyof T] {
  return Object.values(enumObject).includes(value);
}

export function validateClubForm(form: HTMLFormElement): { data?: NewClub; errors: FieldErrors } {
  const formData = new FormData(form);
  const errors: FieldErrors = {};

  const name = getText(formData, "name");
  const countryRaw = getText(formData, "country");
  const city = getText(formData, "city");
  const league = getText(formData, "league");
  const stadium = getText(formData, "stadium");
  const foundedYear = getNumber(formData, "foundedYear");
  const coach = getText(formData, "coach");
  const valueMillions = getNumber(formData, "valueMillions");
  const europeanTitles = getNumber(formData, "europeanTitles");
  const statusRaw = getText(formData, "status");

  if (name.length < 2) errors.name = "A klub neve legalább 2 karakter legyen.";
  if (!isEnumValue(Country, countryRaw)) errors.country = "Válassz országot.";
  if (city.length < 2) errors.city = "A város mező kötelező.";
  if (league.length < 2) errors.league = "A liga mező kötelező.";
  if (stadium.length < 2) errors.stadium = "A stadion mező kötelező.";
  if (!Number.isInteger(foundedYear) || foundedYear < 1850 || foundedYear > new Date().getFullYear()) {
    errors.foundedYear = "Az alapítás éve 1850 és az aktuális év között legyen.";
  }
  if (coach.length < 2) errors.coach = "Az edző neve kötelező.";
  if (!Number.isFinite(valueMillions) || valueMillions < 0) errors.valueMillions = "A piaci érték nem lehet negatív.";
  if (!Number.isInteger(europeanTitles) || europeanTitles < 0) errors.europeanTitles = "A címek száma 0 vagy pozitív egész szám legyen.";
  if (!isEnumValue(ClubStatus, statusRaw)) errors.status = "Válassz státuszt.";

  if (Object.keys(errors).length > 0 || !isEnumValue(Country, countryRaw) || !isEnumValue(ClubStatus, statusRaw)) {
    return { errors };
  }

  return {
    data: {
      name,
      country: countryRaw,
      city,
      league,
      stadium,
      foundedYear,
      coach,
      valueMillions,
      europeanTitles,
      status: statusRaw
    },
    errors
  };
}

export function validateMatchForm(form: HTMLFormElement): { data?: NewMatch; errors: FieldErrors } {
  const formData = new FormData(form);
  const errors: FieldErrors = {};

  const homeClubId = getNumber(formData, "homeClubId");
  const awayClubId = getNumber(formData, "awayClubId");
  const competitionRaw = getText(formData, "competition");
  const date = getText(formData, "date");
  const venue = getText(formData, "venue");
  const homeGoals = getNumber(formData, "homeGoals");
  const awayGoals = getNumber(formData, "awayGoals");
  const statusRaw = getText(formData, "status");
  const importance = getNumber(formData, "importance");

  if (!Number.isInteger(homeClubId) || homeClubId <= 0) errors.homeClubId = "Válassz hazai csapatot.";
  if (!Number.isInteger(awayClubId) || awayClubId <= 0) errors.awayClubId = "Válassz vendég csapatot.";
  if (homeClubId === awayClubId) errors.awayClubId = "A hazai és vendég csapat nem lehet ugyanaz.";
  if (!isEnumValue(Competition, competitionRaw)) errors.competition = "Válassz sorozatot.";
  if (!date) errors.date = "A dátum kötelező.";
  if (venue.length < 2) errors.venue = "A helyszín kötelező.";
  if (!Number.isInteger(homeGoals) || homeGoals < 0) errors.homeGoals = "A hazai gólok száma 0 vagy pozitív egész legyen.";
  if (!Number.isInteger(awayGoals) || awayGoals < 0) errors.awayGoals = "A vendég gólok száma 0 vagy pozitív egész legyen.";
  if (!isEnumValue(MatchStatus, statusRaw)) errors.status = "Válassz meccs státuszt.";
  if (!Number.isInteger(importance) || importance < 1 || importance > 5) errors.importance = "A fontosság 1 és 5 közötti egész szám legyen.";

  if (Object.keys(errors).length > 0 || !isEnumValue(Competition, competitionRaw) || !isEnumValue(MatchStatus, statusRaw)) {
    return { errors };
  }

  return {
    data: {
      homeClubId,
      awayClubId,
      competition: competitionRaw,
      date,
      venue,
      homeGoals,
      awayGoals,
      status: statusRaw,
      importance
    },
    errors
  };
}
