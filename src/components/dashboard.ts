import type { Club, Match } from "../types/football";
import { MatchStatus } from "../types/football";
import { formatDate, formatMoney } from "../utils/dom";

function clubName(clubs: Club[], id: number): string {
  return clubs.find((club) => club.id === id)?.name ?? "Ismeretlen klub";
}

export function renderDashboard(clubs: Club[], matches: Match[]): string {
  const totalValue = clubs.reduce((sum, club) => sum + club.valueMillions, 0);
  const playedMatches = matches.filter((match) => match.status === MatchStatus.Played).length;
  const scheduledMatches = matches.filter((match) => match.status === MatchStatus.Scheduled);
  const nextMatch = scheduledMatches
    .slice()
    .sort((first, second) => first.date.localeCompare(second.date))[0];
  const topClub = clubs.slice().sort((first, second) => second.valueMillions - first.valueMillions)[0];

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Áttekintés</p>
        <h2>Dashboard</h2>
        <p>Gyors statisztikák a klubokról és a közelgő meccsekről.</p>
      </div>
      <div class="action-row">
        <a class="button button--primary" href="#/clubs/new">+ Új klub</a>
        <a class="button button--secondary" href="#/matches/new">+ Új meccs</a>
      </div>
    </section>

    <section class="stats-grid" aria-label="Fő statisztikák">
      <article class="stat-card">
        <span class="stat-card__label">Klubok száma</span>
        <strong>${clubs.length}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-card__label">Meccsek száma</span>
        <strong>${matches.length}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-card__label">Lejátszott meccsek</span>
        <strong>${playedMatches}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-card__label">Összes piaci érték</span>
        <strong>${formatMoney(totalValue)}</strong>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel">
        <h3>Legértékesebb klub</h3>
        ${topClub ? `
          <p class="panel__highlight">${topClub.name}</p>
          <p>${topClub.league} · ${topClub.city}</p>
          <p>Piaci érték: <strong>${formatMoney(topClub.valueMillions)}</strong></p>
          <a class="text-link" href="#/clubs/${topClub.id}">Részletek megnyitása</a>
        ` : "<p>Nincs klubadat.</p>"}
      </article>
      <article class="panel">
        <h3>Következő kiemelt meccs</h3>
        ${nextMatch ? `
          <p class="panel__highlight">${clubName(clubs, nextMatch.homeClubId)} – ${clubName(clubs, nextMatch.awayClubId)}</p>
          <p>${nextMatch.competition} · ${formatDate(nextMatch.date)}</p>
          <p>Helyszín: <strong>${nextMatch.venue}</strong></p>
          <a class="text-link" href="#/matches/${nextMatch.id}">Részletek megnyitása</a>
        ` : "<p>Nincs beütemezett meccs.</p>"}
      </article>
    </section>
  `;
}
