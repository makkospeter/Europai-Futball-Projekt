import type { RouteName } from "../types/routes";

function navLink(label: string, href: string, current: RouteName, activeRoutes: RouteName[]): string {
  const activeClass = activeRoutes.includes(current) ? "nav__link nav__link--active" : "nav__link";
  return `<a class="${activeClass}" href="${href}">${label}</a>`;
}

export function renderLayout(currentRoute: RouteName, content: string): string {
  return `
    <header class="hero">
      <nav class="nav" aria-label="Fő navigáció">
        <a class="brand" href="#/">
          <span class="brand__icon">⚽</span>
          <span>Euro Football Manager</span>
        </a>
        <div class="nav__links">
          ${navLink("Dashboard", "#/", currentRoute, ["dashboard"])}
          ${navLink("Klubok", "#/clubs", currentRoute, ["clubs", "club-detail", "club-new", "club-edit"])}
          ${navLink("Meccsek", "#/matches", currentRoute, ["matches", "match-detail", "match-new", "match-edit"])}
        </div>
      </nav>
      <section class="hero__content">
        <p class="eyebrow">Korszerű webalkalmazás európai futballklubok és mérkőzések rendszerezett áttekintésére.</p>
        <h1>Európai futball adatkezelő</h1>
        <p>Európai futballklubok és kiemelt mérkőzések átlátható, naprakész és felhasználóbarát kezelése.</p>
      </section>
    </header>
    <main class="container" id="page-content">
      ${content}
    </main>
  `;
}

export function loadingView(message: string): string {
  return `
    <section class="state-card" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <h2>${message}</h2>
      <p>Kapcsolódás a JSON Serverhez...</p>
    </section>
  `;
}

export function errorView(message: string): string {
  return `
    <section class="state-card state-card--error" role="alert">
      <h2>Hiba történt</h2>
      <p>${message}</p>
      <a class="button button--primary" href="#/">Vissza a főoldalra</a>
    </section>
  `;
}

export function notFoundView(): string {
  return `
    <section class="state-card">
      <h2>Az oldal nem található</h2>
      <p>Ellenőrizd az URL-t, vagy menj vissza a dashboardra.</p>
      <a class="button button--primary" href="#/">Dashboard</a>
    </section>
  `;
}

export function emptyView(title: string, message: string, ctaHref: string, ctaLabel: string): string {
  return `
    <section class="state-card">
      <h2>${title}</h2>
      <p>${message}</p>
      <a class="button button--primary" href="${ctaHref}">${ctaLabel}</a>
    </section>
  `;
}
