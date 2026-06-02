export type RouteName =
  | "dashboard"
  | "clubs"
  | "club-detail"
  | "club-new"
  | "club-edit"
  | "matches"
  | "match-detail"
  | "match-new"
  | "match-edit"
  | "not-found";

export interface Route {
  name: RouteName;
  id?: number;
}
