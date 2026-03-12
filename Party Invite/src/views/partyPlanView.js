import { eventContent, foodContributors, schedule } from "../data/content.js";
import { getGuestById } from "../data/guests.js";

export function renderPartyPlanView() {
  return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Party plan</p>
          <h2>The campaign is the main event</h2>
          <p class="section-copy">The schedule and food lineup now sit in a lighter, denser planning view.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Campaign start target: ${eventContent.campaignStart}</div>
        </div>
      </header>

      <div class="dashboard-grid">
        <article class="card accent-card">
          <p class="section-kicker">Main activity</p>
          <h3>Daggerheart with a Jenga twist</h3>
          <p>Kyle is running an original Daggerheart session. Food breaks happen around the game, not instead of it.</p>
        </article>
        <article class="card">
          <p class="section-kicker">Event framing</p>
          <h3>Celebration first, spreadsheet never</h3>
          <p>${eventContent.intro}</p>
          <p class="muted">${eventContent.accommodation}</p>
        </article>
      </div>

      <div class="section-block-head">
        <div>
          <p class="section-kicker">Timeline</p>
          <h3>What happens when</h3>
        </div>
      </div>
      <div class="timeline">
        ${schedule
          .map(
            (step) => `
              <article class="timeline-row">
                <div class="timeline-time">${step.time}</div>
                <div class="timeline-content">
                  <h4>${step.title}</h4>
                  <p>${step.detail}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="section-block-head">
        <div>
          <p class="section-kicker">Food lineup</p>
          <h3>Who is bringing what</h3>
        </div>
      </div>
      <div class="dashboard-grid">
        ${foodContributors
          .map((entry) => {
            const guest = getGuestById(entry.guestId);
            return `
              <article class="card">
                <p class="section-kicker">${guest?.displayName ?? "Guest"}</p>
                <h3>${entry.item}</h3>
                <p>${entry.note}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}
