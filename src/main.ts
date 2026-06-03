import "./styles/main.css";
import { createClub, createMatch, deleteClub, deleteMatch, getClub, getClubs, getMatch, getMatches, updateClub, updateMatch } from "./api/footballApi";
import { renderClubCard, renderClubDetail, renderClubForm, renderClubList } from "./components/clubs";
import { renderDashboard } from "./components/dashboard";
import { emptyView, errorView, loadingView, notFoundView, renderLayout } from "./components/layout";
import { renderMatchCard, renderMatchDetail, renderMatchForm, renderMatchList } from "./components/matches";
import { MatchStatus, type Club, type FieldErrors, type Match, type NewClub, type NewMatch } from "./types/football";
import type { Route } from "./types/routes";
import { selectElement, showToast } from "./utils/dom";
import { validateClubForm, validateMatchForm } from "./utils/forms";

const app = selectElement<HTMLDivElement>("#app");

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ismeretlen hiba történt.";
}

function setPage(route: Route, html: string): void {
  app.innerHTML = renderLayout(route.name, html);
}

function setLoading(route: Route, message: string): void {
  setPage(route, loadingView(message));
}

function parseId(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function parseRoute(): Route {
  const normalizedHash = window.location.hash.replace(/^#/, "") || "/";
  const parts = normalizedHash.split("/").filter(Boolean);

  if (parts.length === 0) return { name: "dashboard" };

  if (parts[0] === "clubs") {
    if (parts.length === 1) return { name: "clubs" };
    if (parts[1] === "new") return { name: "club-new" };

    const id = parseId(parts[1]);
    if (!id) return { name: "not-found" };
    if (parts.length === 2) return { name: "club-detail", id };
    if (parts[2] === "edit") return { name: "club-edit", id };
  }

  if (parts[0] === "matches") {
    if (parts.length === 1) return { name: "matches" };
    if (parts[1] === "new") return { name: "match-new" };

    const id = parseId(parts[1]);
    if (!id) return { name: "not-found" };
    if (parts.length === 2) return { name: "match-detail", id };
    if (parts[2] === "edit") return { name: "match-edit", id };
  }

  return { name: "not-found" };
}

async function renderDashboardPage(route: Route): Promise<void> {
  setLoading(route, "Dashboard betöltése");
  try {
    const [clubs, matches] = await Promise.all([getClubs(), getMatches()]);
    setPage(route, renderDashboard(clubs, matches));
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

async function renderClubsPage(route: Route): Promise<void> {
  setLoading(route, "Klubok betöltése");
  try {
    const clubs = await getClubs();

    if (clubs.length === 0) {
      setPage(route, emptyView("Nincs klub", "Hozz létre legalább egy klubot a kezdéshez.", "#/clubs/new", "+ Új klub"));
      return;
    }

    setPage(route, renderClubList(clubs));
    attachClubListListeners(clubs);
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

function attachClubListListeners(clubs: Club[]): void {
  const searchInput = selectElement<HTMLInputElement>("#club-search");
  const countryFilter = selectElement<HTMLSelectElement>("#club-country-filter");
  const list = selectElement<HTMLElement>("#club-list");

  const renderFilteredClubs = (): void => {
    const query = searchInput.value.trim().toLowerCase();
    const country = countryFilter.value;
    const filtered = clubs.filter((club) => {
      const matchesQuery = `${club.name} ${club.city} ${club.league}`.toLowerCase().includes(query);
      const matchesCountry = country === "all" || club.country === country;
      return matchesQuery && matchesCountry;
    });

    list.innerHTML = filtered.length > 0
      ? filtered.map(renderClubCard).join("")
      : `<section class="state-card"><h2>Nincs találat</h2><p>Próbálj másik keresést vagy szűrőt.</p></section>`;
    attachDeleteClubListeners();
  };

  searchInput.addEventListener("input", renderFilteredClubs);
  countryFilter.addEventListener("change", renderFilteredClubs);
  attachDeleteClubListeners();
}

function attachDeleteClubListeners(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-delete-club]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = parseId(button.dataset.deleteClub);
      if (!id) return;

      const confirmed = window.confirm("Biztosan törlöd ezt a klubot? A kapcsolódó meccsekben is eltűnhet a hivatkozás.");
      if (!confirmed) return;

      try {
        await deleteClub(id);
        showToast("Klub sikeresen törölve.");
        await renderClubsPage({ name: "clubs" });
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      }
    });
  });
}

async function renderClubDetailPage(route: Route): Promise<void> {
  if (!route.id) {
    setPage(route, notFoundView());
    return;
  }

  setLoading(route, "Klub részleteinek betöltése");
  try {
    const club = await getClub(route.id);
    setPage(route, renderClubDetail(club));
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

function attachClubFormListener(route: Route, mode: "create" | "edit", existingClub?: Club): void {
  const form = selectElement<HTMLFormElement>("#club-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const validation = validateClubForm(form);

    if (!validation.data) {
      setPage(route, renderClubForm(mode, validation.errors, existingClub));
      attachClubFormListener(route, mode, existingClub);
      return;
    }

    try {
      const savedClub = mode === "create"
        ? await createClub(validation.data)
        : await updateClub(existingClub?.id ?? 0, validation.data);

      showToast(mode === "create" ? "Klub létrehozva." : "Klub módosítva.");
      window.location.hash = `#/clubs/${savedClub.id}`;
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  });
}

function renderClubCreatePage(route: Route, errors: FieldErrors = {}, data?: NewClub): void {
  setPage(route, renderClubForm("create", errors, data));
  attachClubFormListener(route, "create");
}

async function renderClubEditPage(route: Route): Promise<void> {
  if (!route.id) {
    setPage(route, notFoundView());
    return;
  }

  setLoading(route, "Klub szerkesztő betöltése");
  try {
    const club = await getClub(route.id);
    setPage(route, renderClubForm("edit", {}, club));
    attachClubFormListener(route, "edit", club);
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

async function renderMatchesPage(route: Route): Promise<void> {
  setLoading(route, "Meccsek betöltése");
  try {
    const [matches, clubs] = await Promise.all([getMatches(), getClubs()]);

    if (matches.length === 0) {
      setPage(route, emptyView("Nincs meccs", "Hozz létre legalább egy meccset a kezdéshez.", "#/matches/new", "+ Új meccs"));
      return;
    }

    setPage(route, renderMatchList(matches, clubs));
    attachMatchListListeners(matches, clubs);
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

function attachMatchListListeners(matches: Match[], clubs: Club[]): void {
  const searchInput = selectElement<HTMLInputElement>("#match-search");
  const statusFilter = selectElement<HTMLSelectElement>("#match-status-filter");
  const list = selectElement<HTMLElement>("#match-list");

  const getClubName = (id: number): string => clubs.find((club) => club.id === id)?.name ?? "Ismeretlen klub";

  const renderFilteredMatches = (): void => {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const filtered = matches.filter((match) => {
      const keywords = `${getClubName(match.homeClubId)} ${getClubName(match.awayClubId)} ${match.competition} ${match.venue}`.toLowerCase();
      const matchesQuery = keywords.includes(query);
      const matchesStatus = status === "all" || match.status === status;
      return matchesQuery && matchesStatus;
    });

    list.innerHTML = filtered.length > 0
      ? filtered.map((match) => renderMatchCard(match, clubs)).join("")
      : `<section class="state-card"><h2>Nincs találat</h2><p>Próbálj másik keresést vagy státuszt.</p></section>`;
    attachDeleteMatchListeners();
  };

  searchInput.addEventListener("input", renderFilteredMatches);
  statusFilter.addEventListener("change", renderFilteredMatches);
  attachDeleteMatchListeners();
}

function attachDeleteMatchListeners(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-delete-match]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = parseId(button.dataset.deleteMatch);
      if (!id) return;

      const confirmed = window.confirm("Biztosan törlöd ezt a meccset?");
      if (!confirmed) return;

      try {
        await deleteMatch(id);
        showToast("Meccs sikeresen törölve.");
        await renderMatchesPage({ name: "matches" });
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      }
    });
  });
}

async function renderMatchDetailPage(route: Route): Promise<void> {
  if (!route.id) {
    setPage(route, notFoundView());
    return;
  }

  setLoading(route, "Meccs részleteinek betöltése");
  try {
    const [match, clubs] = await Promise.all([getMatch(route.id), getClubs()]);
    setPage(route, renderMatchDetail(match, clubs));
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

function attachMatchFormListener(route: Route, clubs: Club[], mode: "create" | "edit", existingMatch?: Match): void {
  const form = selectElement<HTMLFormElement>("#match-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const validation = validateMatchForm(form);

    if (!validation.data) {
      setPage(route, renderMatchForm(mode, clubs, validation.errors, existingMatch));
      attachMatchFormListener(route, clubs, mode, existingMatch);
      return;
    }

    const data = ensureScheduledMatchesHaveZeroScore(validation.data);

    try {
      const savedMatch = mode === "create"
        ? await createMatch(data)
        : await updateMatch(existingMatch?.id ?? 0, data);

      showToast(mode === "create" ? "Meccs létrehozva." : "Meccs módosítva.");
      window.location.hash = `#/matches/${savedMatch.id}`;
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  });
}

function ensureScheduledMatchesHaveZeroScore(match: NewMatch): NewMatch {
  if (match.status === MatchStatus.Scheduled) {
    return {
      ...match,
      homeGoals: 0,
      awayGoals: 0
    };
  }

  return match;
}

async function renderMatchCreatePage(route: Route): Promise<void> {
  setLoading(route, "Meccs űrlap betöltése");
  try {
    const clubs = await getClubs();
    if (clubs.length < 2) {
      setPage(route, emptyView("Legalább két klub szükséges", "Meccs létrehozásához előbb vigyél fel legalább két klubot.", "#/clubs/new", "+ Új klub"));
      return;
    }

    setPage(route, renderMatchForm("create", clubs));
    attachMatchFormListener(route, clubs, "create");
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

async function renderMatchEditPage(route: Route): Promise<void> {
  if (!route.id) {
    setPage(route, notFoundView());
    return;
  }

  setLoading(route, "Meccs szerkesztő betöltése");
  try {
    const [match, clubs] = await Promise.all([getMatch(route.id), getClubs()]);
    setPage(route, renderMatchForm("edit", clubs, {}, match));
    attachMatchFormListener(route, clubs, "edit", match);
  } catch (error) {
    setPage(route, errorView(getErrorMessage(error)));
  }
}

async function router(): Promise<void> {
  const route = parseRoute();

  switch (route.name) {
    case "dashboard":
      await renderDashboardPage(route);
      break;
    case "clubs":
      await renderClubsPage(route);
      break;
    case "club-detail":
      await renderClubDetailPage(route);
      break;
    case "club-new":
      renderClubCreatePage(route);
      break;
    case "club-edit":
      await renderClubEditPage(route);
      break;
    case "matches":
      await renderMatchesPage(route);
      break;
    case "match-detail":
      await renderMatchDetailPage(route);
      break;
    case "match-new":
      await renderMatchCreatePage(route);
      break;
    case "match-edit":
      await renderMatchEditPage(route);
      break;
    case "not-found":
      setPage(route, notFoundView());
      break;
  }
}

window.addEventListener("hashchange", () => {
  void router();
});

void router();
