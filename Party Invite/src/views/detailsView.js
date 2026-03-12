import { dietaryFlags, eventContent } from "../data/content.js";

export function renderDetailsView({ state, guest }) {
  const existingDetails = state.shared.guestDetails[guest.id] ?? {
    dietaryFlags: [],
    dietaryNotes: "",
    allergyNotes: "",
    messageToKyle: ""
  };

  return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">My details</p>
          <h2>Dietary restrictions, allergies, and notes</h2>
          <p class="section-copy">Important info stays prominent without the old oversized form chrome.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Shared with Kyle through the sync layer</div>
        </div>
      </header>

      <section class="card">
        <p class="muted">${eventContent.safetyNote}</p>
        <form class="inline-form" data-form="save-guest-details">
          <fieldset class="checkbox-grid">
            <legend>Dietary flags</legend>
            ${dietaryFlags
              .map(
                (flag) => `
                  <label class="check-pill">
                    <input
                      type="checkbox"
                      name="dietaryFlags"
                      value="${flag}"
                      ${existingDetails.dietaryFlags.includes(flag) ? "checked" : ""}
                    />
                    <span>${flag}</span>
                  </label>
                `
              )
              .join("")}
          </fieldset>

          <label class="field">
            <span>Dietary notes</span>
            <textarea name="dietaryNotes" rows="3" placeholder="Preferences, sensitivities, or what you would like Kyle to plan around">${existingDetails.dietaryNotes}</textarea>
          </label>

          <label class="field">
            <span>Allergies (anything that could make you sick)</span>
            <textarea name="allergyNotes" rows="3" placeholder="Be specific so this is not missed">${existingDetails.allergyNotes}</textarea>
          </label>

          <label class="field">
            <span>Anything else Kyle should know?</span>
            <textarea name="messageToKyle" rows="3" placeholder="Travel changes, timing, sleeping arrangements, or general notes">${existingDetails.messageToKyle}</textarea>
          </label>

          <div class="button-row">
            <button class="button button-primary" type="submit">Save my details</button>
            ${
              existingDetails.updatedAt
                ? `<span class="status-line">Last updated ${new Date(existingDetails.updatedAt).toLocaleString()}</span>`
                : ""
            }
          </div>
        </form>
      </section>
    </section>
  `;
}
