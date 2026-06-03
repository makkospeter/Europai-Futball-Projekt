import { Competition, MatchStatus, type Club, type FieldErrors, type Match, type NewMatch } from "../types/football";
import { escapeHtml, formatDate } from "../utils/dom";

function clubName(clubs: Club[], id: number): string {
  return clubs.find((club) => club.id === id)?.name ?? "Ismeretlen klub";
}

function score(match: Match): string {
  return match.status === MatchStatus.Played ? `${match.homeGoals}–${match.awayGoals}` : "még nincs eredmény";
}

function statusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    [MatchStatus.Scheduled]: "Tervezett",
    [MatchStatus.Played]: "Lejátszott"
  };

  return labels[status];
}

function fieldError(name: string, errors: FieldErrors): string {
  return errors[name] ? `<small class="field__error">${errors[name]}</small>` : "";
}

function renderSelect<T extends string>(name: string, values: T[], selected: T, label: string, errors: FieldErrors): string {
  return `
    <label class="field">
      <span>${label}</span>
      <select name="${name}">
        ${values.map((value) => `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`).join("")}
      </select>
      ${fieldError(name, errors)}
    </label>
  `;
}

function renderClubOptions(clubs: Club[], selectedId: number): string {
  return clubs
    .map((club) => `<option value="${club.id}" ${club.id === selectedId ? "selected" : ""}>${escapeHtml(club.name)}</option>`)
    .join("");
}

export function renderMatchList(matches: Match[], clubs: Club[]): string {
  if (matches.length === 0) {
    return "";
  }

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Meccsnaptár</p>
        <h2>Meccsek</h2>
        <p>Rangadók listázása, létrehozása, szerkesztése és törlése.</p>
      </div>
      <a class="button button--primary" href="#/matches/new">+ Új meccs</a>
    </section>

    <section class="toolbar" aria-label="Meccs szűrők">
      <label class="field field--toolbar">
        <span>Keresés</span>
        <input id="match-search" type="search" placeholder="Csapat, helyszín vagy sorozat..." />
      </label>
      <label class="field field--toolbar">
        <span>Státusz</span>
        <select id="match-status-filter">
          <option value="all">Összes státusz</option>
          ${Object.values(MatchStatus).map((status) => `<option value="${status}">${statusLabel(status)}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="match-list" id="match-list" aria-label="Meccs lista">
      ${matches.map((match) => renderMatchCard(match, clubs)).join("")}
    </section>
  `;
}

export function renderMatchCard(match: Match, clubs: Club[]): string {
  const homeClub = clubName(clubs, match.homeClubId);
  const awayClub = clubName(clubs, match.awayClubId);
  const keywords = `${homeClub} ${awayClub} ${match.competition} ${match.venue}`.toLowerCase();

  return `
    <article class="match-card" data-keywords="${escapeHtml(keywords)}" data-status="${match.status}">
      <div class="match-card__header">
        <span class="badge">${match.competition}</span>
        <span class="status status--${match.status.toLowerCase()}">${statusLabel(match.status)}</span>
      </div>
      <div class="scoreboard">
        <span>${escapeHtml(homeClub)}</span>
        <strong>${score(match)}</strong>
        <span>${escapeHtml(awayClub)}</span>
      </div>
      <p>${formatDate(match.date)} · ${escapeHtml(match.venue)}</p>
      <p>Értékelés: ${"★".repeat(match.importance)}${"☆".repeat(5 - match.importance)}</p>
      <div class="card-actions">
        <a class="button button--small" href="#/matches/${match.id}">Részletek</a>
        <a class="button button--small button--secondary" href="#/matches/${match.id}/edit">Szerkesztés</a>
        <button class="button button--small button--danger" data-delete-match="${match.id}" type="button">Törlés</button>
      </div>
    </article>
  `;
}

export function renderMatchDetail(match: Match, clubs: Club[]): string {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Meccs részletek</p>
        <h2>${escapeHtml(clubName(clubs, match.homeClubId))} – ${escapeHtml(clubName(clubs, match.awayClubId))}</h2>
        <p>${match.competition} · ${formatDate(match.date)}</p>
      </div>
      <div class="action-row">
        <a class="button button--secondary" href="#/matches">Vissza</a>
        <a class="button button--primary" href="#/matches/${match.id}/edit">Szerkesztés</a>
      </div>
    </section>

    <article class="detail-card">
      <div class="detail-card__hero">
        <span class="badge">${match.competition}</span>
        <h3>${escapeHtml(clubName(clubs, match.homeClubId))} ${score(match)} ${escapeHtml(clubName(clubs, match.awayClubId))}</h3>
        <p>${statusLabel(match.status)}</p>
      </div>
      <dl class="detail-grid">
        <div><dt>Hazai klub</dt><dd>${escapeHtml(clubName(clubs, match.homeClubId))}</dd></div>
        <div><dt>Vendég klub</dt><dd>${escapeHtml(clubName(clubs, match.awayClubId))}</dd></div>
        <div><dt>Sorozat</dt><dd>${match.competition}</dd></div>
        <div><dt>Dátum</dt><dd>${formatDate(match.date)}</dd></div>
        <div><dt>Helyszín</dt><dd>${escapeHtml(match.venue)}</dd></div>
        <div><dt>Hazai gólok</dt><dd>${match.homeGoals}</dd></div>
        <div><dt>Vendég gólok</dt><dd>${match.awayGoals}</dd></div>
        <div><dt>Fontosság</dt><dd>${match.importance}/5</dd></div>
      </dl>
    </article>
  `;
}

export function renderMatchForm(mode: "create" | "edit", clubs: Club[], errors: FieldErrors = {}, match?: Match | NewMatch): string {
  const firstClubId = clubs[0]?.id ?? 0;
  const secondClubId = clubs[1]?.id ?? firstClubId;
  const current: NewMatch = match ?? {
    homeClubId: firstClubId,
    awayClubId: secondClubId,
    competition: Competition.ChampionsLeague,
    date: new Date().toISOString().slice(0, 10),
    venue: "",
    homeGoals: 0,
    awayGoals: 0,
    status: MatchStatus.Scheduled,
    importance: 3
  };
  const title = mode === "create" ? "Új meccs felvitele" : "Meccs szerkesztése";
  const submitLabel = mode === "create" ? "Meccs létrehozása" : "Módosítás mentése";

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Űrlap</p>
        <h2>${title}</h2>
        <p>A hazai és vendég csapat nem lehet ugyanaz.</p>
      </div>
      <a class="button button--secondary" href="#/matches">Mégse</a>
    </section>

    <form class="form-card" id="match-form" novalidate>
      <div class="form-grid">
        <label class="field">
          <span>Hazai klub *</span>
          <select name="homeClubId">${renderClubOptions(clubs, current.homeClubId)}</select>
          ${fieldError("homeClubId", errors)}
        </label>
        <label class="field">
          <span>Vendég klub *</span>
          <select name="awayClubId">${renderClubOptions(clubs, current.awayClubId)}</select>
          ${fieldError("awayClubId", errors)}
        </label>
        ${renderSelect("competition", Object.values(Competition), current.competition, "Sorozat *", errors)}
        <label class="field">
          <span>Dátum *</span>
          <input name="date" type="date" value="${current.date}" />
          ${fieldError("date", errors)}
        </label>
        <label class="field">
          <span>Helyszín *</span>
          <input name="venue" value="${escapeHtml(current.venue)}" placeholder="pl. Wembley" />
          ${fieldError("venue", errors)}
        </label>
        <label class="field">
          <span>Hazai gólok *</span>
          <input name="homeGoals" type="number" min="0" value="${current.homeGoals}" />
          ${fieldError("homeGoals", errors)}
        </label>
        <label class="field">
          <span>Vendég gólok *</span>
          <input name="awayGoals" type="number" min="0" value="${current.awayGoals}" />
          ${fieldError("awayGoals", errors)}
        </label>
        ${renderSelect("status", Object.values(MatchStatus), current.status, "Státusz *", errors)}
        <label class="field">
          <span>Fontosság 1–5 *</span>
          <input name="importance" type="number" min="1" max="5" value="${current.importance}" />
          ${fieldError("importance", errors)}
        </label>
      </div>
      <div class="form-actions">
        <button class="button button--primary" type="submit">${submitLabel}</button>
        <a class="button button--secondary" href="#/matches">Vissza</a>
      </div>
    </form>
  `;
}
