import { ClubStatus, Country, type Club, type FieldErrors, type NewClub } from "../types/football";
import { escapeHtml, formatMoney } from "../utils/dom";

function statusLabel(status: ClubStatus): string {
  const labels: Record<ClubStatus, string> = {
    [ClubStatus.Active]: "Aktív",
    [ClubStatus.Rebuilding]: "Újjáépülő",
    [ClubStatus.Champion]: "Bajnok"
  };

  return labels[status];
}

function renderSelect<T extends string>(name: string, values: T[], selected: T, label: string, errors: FieldErrors): string {
  return `
    <label class="field">
      <span>${label}</span>
      <select name="${name}">
        ${values.map((value) => `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`).join("")}
      </select>
      ${errors[name] ? `<small class="field__error">${errors[name]}</small>` : ""}
    </label>
  `;
}

function fieldError(name: string, errors: FieldErrors): string {
  return errors[name] ? `<small class="field__error">${errors[name]}</small>` : "";
}

export function renderClubList(clubs: Club[]): string {
  if (clubs.length === 0) {
    return "";
  }

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Klub adatbázis</p>
        <h2>Klubok</h2>
        <p>Keresés, szűrés, részletek, szerkesztés és törlés.</p>
      </div>
      <a class="button button--primary" href="#/clubs/new">+ Új klub</a>
    </section>

    <section class="toolbar" aria-label="Klub szűrők">
      <label class="field field--toolbar">
        <span>Keresés</span>
        <input id="club-search" type="search" placeholder="Klub, város vagy liga..." />
      </label>
      <label class="field field--toolbar">
        <span>Ország</span>
        <select id="club-country-filter">
          <option value="all">Összes ország</option>
          ${Object.values(Country).map((country) => `<option value="${country}">${country}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="card-grid" id="club-list" aria-label="Klub lista">
      ${clubs.map(renderClubCard).join("")}
    </section>
  `;
}

export function renderClubCard(club: Club): string {
  return `
    <article class="club-card" data-name="${escapeHtml(club.name.toLowerCase())}" data-country="${club.country}" data-keywords="${escapeHtml(`${club.name} ${club.city} ${club.league}`.toLowerCase())}">
      <div class="club-card__top">
        <div>
          <p class="badge">${club.country}</p>
          <h3>${escapeHtml(club.name)}</h3>
        </div>
        <span class="status status--${club.status.toLowerCase()}">${statusLabel(club.status)}</span>
      </div>
      <dl class="meta-list">
        <div><dt>Város</dt><dd>${escapeHtml(club.city)}</dd></div>
        <div><dt>Liga</dt><dd>${escapeHtml(club.league)}</dd></div>
        <div><dt>Stadion</dt><dd>${escapeHtml(club.stadium)}</dd></div>
        <div><dt>Érték</dt><dd>${formatMoney(club.valueMillions)}</dd></div>
      </dl>
      <div class="card-actions">
        <a class="button button--small" href="#/clubs/${club.id}">Részletek</a>
        <a class="button button--small button--secondary" href="#/clubs/${club.id}/edit">Szerkesztés</a>
        <button class="button button--small button--danger" data-delete-club="${club.id}" type="button">Törlés</button>
      </div>
    </article>
  `;
}

export function renderClubDetail(club: Club): string {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Klub részletek</p>
        <h2>${escapeHtml(club.name)}</h2>
        <p>${escapeHtml(club.city)} · ${escapeHtml(club.league)}</p>
      </div>
      <div class="action-row">
        <a class="button button--secondary" href="#/clubs">Vissza</a>
        <a class="button button--primary" href="#/clubs/${club.id}/edit">Szerkesztés</a>
      </div>
    </section>

    <article class="detail-card">
      <div class="detail-card__hero">
        <span class="badge">${club.country}</span>
        <h3>${escapeHtml(club.name)}</h3>
        <p>${statusLabel(club.status)}</p>
      </div>
      <dl class="detail-grid">
        <div><dt>Város</dt><dd>${escapeHtml(club.city)}</dd></div>
        <div><dt>Liga</dt><dd>${escapeHtml(club.league)}</dd></div>
        <div><dt>Stadion</dt><dd>${escapeHtml(club.stadium)}</dd></div>
        <div><dt>Alapítva</dt><dd>${club.foundedYear}</dd></div>
        <div><dt>Edző</dt><dd>${escapeHtml(club.coach)}</dd></div>
        <div><dt>Piaci érték</dt><dd>${formatMoney(club.valueMillions)}</dd></div>
        <div><dt>Európai címek</dt><dd>${club.europeanTitles}</dd></div>
        <div><dt>Státusz</dt><dd>${statusLabel(club.status)}</dd></div>
      </dl>
    </article>
  `;
}

export function renderClubForm(mode: "create" | "edit", errors: FieldErrors = {}, club?: Club | NewClub): string {
  const current: NewClub = club ?? {
    name: "",
    country: Country.Spain,
    city: "",
    league: "",
    stadium: "",
    foundedYear: 1900,
    coach: "",
    valueMillions: 0,
    europeanTitles: 0,
    status: ClubStatus.Active
  };
  const title = mode === "create" ? "Új klub felvitele" : "Klub szerkesztése";
  const submitLabel = mode === "create" ? "Klub létrehozása" : "Módosítás mentése";

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Űrlap</p>
        <h2>${title}</h2>
        <p>A csillaggal jelölt adatok kötelezőek, a hibák mezőnként jelennek meg.</p>
      </div>
      <a class="button button--secondary" href="#/clubs">Mégse</a>
    </section>

    <form class="form-card" id="club-form" novalidate>
      <div class="form-grid">
        <label class="field">
          <span>Klub neve *</span>
          <input name="name" value="${escapeHtml(current.name)}" placeholder="pl. Real Madrid" />
          ${fieldError("name", errors)}
        </label>
        ${renderSelect("country", Object.values(Country), current.country, "Ország *", errors)}
        <label class="field">
          <span>Város *</span>
          <input name="city" value="${escapeHtml(current.city)}" placeholder="pl. Madrid" />
          ${fieldError("city", errors)}
        </label>
        <label class="field">
          <span>Liga *</span>
          <input name="league" value="${escapeHtml(current.league)}" placeholder="pl. La Liga" />
          ${fieldError("league", errors)}
        </label>
        <label class="field">
          <span>Stadion *</span>
          <input name="stadium" value="${escapeHtml(current.stadium)}" placeholder="pl. Santiago Bernabéu" />
          ${fieldError("stadium", errors)}
        </label>
        <label class="field">
          <span>Alapítás éve *</span>
          <input name="foundedYear" type="number" value="${current.foundedYear}" />
          ${fieldError("foundedYear", errors)}
        </label>
        <label class="field">
          <span>Edző *</span>
          <input name="coach" value="${escapeHtml(current.coach)}" placeholder="pl. Carlo Ancelotti" />
          ${fieldError("coach", errors)}
        </label>
        <label class="field">
          <span>Piaci érték, millió € *</span>
          <input name="valueMillions" type="number" min="0" value="${current.valueMillions}" />
          ${fieldError("valueMillions", errors)}
        </label>
        <label class="field">
          <span>Európai címek *</span>
          <input name="europeanTitles" type="number" min="0" value="${current.europeanTitles}" />
          ${fieldError("europeanTitles", errors)}
        </label>
        ${renderSelect("status", Object.values(ClubStatus), current.status, "Státusz *", errors)}
      </div>
      <div class="form-actions">
        <button class="button button--primary" type="submit">${submitLabel}</button>
        <a class="button button--secondary" href="#/clubs">Vissza</a>
      </div>
    </form>
  `;
}
