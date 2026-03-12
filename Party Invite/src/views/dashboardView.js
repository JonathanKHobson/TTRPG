import { eventContent, partyTabs } from "../data/content.js";
import { renderActivitiesView } from "./activitiesView.js";
import { renderDetailsView } from "./detailsView.js";
import { renderGroceriesView } from "./groceriesView.js";
import { renderMyInfoView } from "./myInfoView.js";
import { renderPartyPlanView } from "./partyPlanView.js";

function renderActiveTab(context) {
  switch (context.state.currentTab) {
    case "party-plan":
      return renderPartyPlanView(context);
    case "groceries":
      return renderGroceriesView(context);
    case "activities":
      return renderActivitiesView(context);
    case "my-details":
      return renderDetailsView(context);
    case "my-info":
    default:
      return renderMyInfoView(context);
  }
}

function getCurrentTabLabel(tabId) {
  return partyTabs.find((tab) => tab.id === tabId)?.label ?? "Overview";
}

function renderDashboardCelebration(area) {
  const balloons = area === "header" ? ["a", "b", "c"] : ["d", "e"];
  const confetti = area === "header" ? ["a", "b", "c", "d", "e", "f"] : ["g", "h", "i", "j"];
  const sparkName = area === "header" ? "a" : "b";

  return `
    <div class="dashboard-celebration dashboard-celebration-${area}" aria-hidden="true">
      ${balloons.map((name) => `<span class="dashboard-balloon dashboard-balloon-${name}"></span>`).join("")}
      ${confetti.map((name) => `<span class="dashboard-confetti dashboard-confetti-${name}"></span>`).join("")}
      <span class="dashboard-spark dashboard-spark-${sparkName}"></span>
    </div>
  `;
}

export function renderDashboardView(context) {
  const { guest, state } = context;
  const utilityRailCollapsed = state.ui?.utilityRailCollapsed ?? false;

  return `
    <main class="app-shell dashboard-app" id="main-content">
      <header class="top-bar dashboard-top-bar">
        ${renderDashboardCelebration("header")}
        <div class="dashboard-title-group">
          <p class="eyebrow">${eventContent.dateLabel}</p>
          <h1>${eventContent.title}</h1>
        </div>
        <div class="top-bar-actions">
          <div class="guest-chip">
            <span class="guest-chip-label">Adventurer</span>
            <strong>${guest.displayName}</strong>
          </div>
          <button class="button button-secondary" data-action="switch-guest">
            Switch adventurer
          </button>
        </div>
      </header>

      <section class="event-meta-strip card">
        ${renderDashboardCelebration("meta")}
        <div class="event-meta-summary">
          <p class="section-kicker">Quest board</p>
          <p class="event-meta-copy">${eventContent.intro}</p>
        </div>
        <div class="event-meta-pills">
          <span>${eventContent.officialStart} official start</span>
          <span>${eventContent.campaignStart} campaign target</span>
          <span>${eventContent.address.city}</span>
        </div>
      </section>

      <nav class="tab-nav" role="tablist" aria-label="Party tabs">
        ${partyTabs
          .map(
            (tab) => `
              <button
                class="tab-button ${tab.id === state.currentTab ? "tab-active" : ""}"
                role="tab"
                aria-selected="${tab.id === state.currentTab ? "true" : "false"}"
                aria-controls="tab-panel-${tab.id}"
                id="tab-btn-${tab.id}"
                data-action="set-tab"
                data-tab-id="${tab.id}"
              >
                ${tab.label}
              </button>
            `
          )
          .join("")}
      </nav>

      ${state.syncError ? `<section class="inline-alert" role="alert">${state.syncError}</section>` : ""}
      ${state.syncNotice ? `<section class="inline-note" role="status">${state.syncNotice}</section>` : ""}

      <div class="dashboard-layout ${utilityRailCollapsed ? "dashboard-layout-collapsed" : ""}">
        <aside class="dashboard-utility card">
          <div class="dashboard-utility-header">
            <div>
              <p class="section-kicker">Quest brief</p>
              <h2>${guest.displayName}'s board</h2>
            </div>
            <button
              class="utility-toggle"
              type="button"
              aria-expanded="${utilityRailCollapsed ? "false" : "true"}"
              aria-controls="dashboard-utility-body"
              data-action="toggle-utility-rail"
            >
              ${utilityRailCollapsed ? "Show" : "Hide"}
            </button>
          </div>

          <div class="dashboard-utility-body" id="dashboard-utility-body">
            <div class="utility-current-tab">
              <span class="label">Current stop</span>
              <strong>${getCurrentTabLabel(state.currentTab)}</strong>
            </div>
            <ul class="compact-list utility-list">
              <li>Hosted by ${eventContent.hostName}</li>
              <li>Early arrivals from ${eventContent.earlyArrival}</li>
              <li>Main campaign at ${eventContent.campaignStart}</li>
              <li>Use groceries, activities, and notes to coordinate fast.</li>
            </ul>
            <div class="utility-actions">
              <a class="button button-secondary" href="${eventContent.address.mapsUrl}" target="_blank" rel="noreferrer">
                Directions
              </a>
              <button class="button button-secondary" data-action="copy-address">
                ${eventContent.copyAddressLabel}
              </button>
            </div>
          </div>
        </aside>

        <section
          class="dashboard-main-panel"
          role="tabpanel"
          id="tab-panel-${state.currentTab}"
          aria-labelledby="tab-btn-${state.currentTab}"
        >
          ${renderActiveTab(context)}
        </section>
      </div>
    </main>
  `;
}
