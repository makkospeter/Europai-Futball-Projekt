import { request } from "./http";
import type { Club, Match, NewClub, NewMatch } from "../types/football";

export function getClubs(): Promise<Club[]> {
  return request<Club[]>("/clubs?_sort=name&_order=asc");
}

export function getClub(id: number): Promise<Club> {
  return request<Club>(`/clubs/${id}`);
}

export function createClub(club: NewClub): Promise<Club> {
  return request<Club>("/clubs", {
    method: "POST",
    body: JSON.stringify(club)
  });
}

export function updateClub(id: number, club: NewClub): Promise<Club> {
  return request<Club>(`/clubs/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...club })
  });
}

export function deleteClub(id: number): Promise<void> {
  return request<void>(`/clubs/${id}`, {
    method: "DELETE"
  });
}

export function getMatches(): Promise<Match[]> {
  return request<Match[]>("/matches?_sort=date&_order=asc");
}

export function getMatch(id: number): Promise<Match> {
  return request<Match>(`/matches/${id}`);
}

export function createMatch(match: NewMatch): Promise<Match> {
  return request<Match>("/matches", {
    method: "POST",
    body: JSON.stringify(match)
  });
}

export function updateMatch(id: number, match: NewMatch): Promise<Match> {
  return request<Match>(`/matches/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...match })
  });
}

export function deleteMatch(id: number): Promise<void> {
  return request<void>(`/matches/${id}`, {
    method: "DELETE"
  });
}
