import { getGuestById } from "../data/guests.js";
import { groceries, grocerySections } from "../data/groceries.js";

function renderSummaryStat(label, value) {
  return `
    <article class="summary-card">
      <span class="label">${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

export function renderGroceriesView({ state, guest }) {
  const sharedGroceries = state.shared.groceries;
  const additions = sharedGroceries.additions ?? [];
  const selectedSection = state.filters.grocerySection ?? "all";
  const expandedItemId = state.ui?.expandedGroceryItemId ?? null;

  const itemsBySection = grocerySections.map((section) => ({
    ...section,
    items: [
      ...groceries.filter((item) => item.section === section.id),
      ...additions.filter((item) => item.section === section.id)
    ]
  }));

  const visibleSections =
    selectedSection === "all"
      ? itemsBySection
      : itemsBySection.filter((section) => section.id === selectedSection);

  let claimedCount = 0;
  let payHelpCount = 0;
  let requestCount = 0;

  for (const section of itemsBySection) {
    for (const item of section.items) {
      const claimGuestId = item.lockedClaimBy ?? sharedGroceries.claims[item.itemId];
      const payHelpers = sharedGroceries.payHelpers[item.itemId] ?? [];
      const editRequests = sharedGroceries.editRequests[item.itemId] ?? [];

      if (claimGuestId) {
        claimedCount += 1;
      }
      if (payHelpers.length) {
        payHelpCount += 1;
      }
      requestCount += editRequests.length;
    }
  }

  const totalCount = itemsBySection.reduce((sum, section) => sum + section.items.length, 0);
  const unclaimedCount = totalCount - claimedCount;

  return `
    <section class="tab-section groceries-page">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Groceries</p>
          <h2>Claim what you can and keep the board moving</h2>
          <p class="section-copy">The grocery board is now optimized for quick claiming on desktop, with deeper notes tucked away until someone needs them.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Shared across guests when live sync is enabled</div>
        </div>
      </header>

      <section class="summary-row" aria-label="Groceries summary">
        ${renderSummaryStat("Total items", totalCount)}
        ${renderSummaryStat("Claimed", claimedCount)}
        ${renderSummaryStat("Unclaimed", unclaimedCount)}
        ${renderSummaryStat("Pay help active", payHelpCount)}
        ${renderSummaryStat("Requests", requestCount)}
      </section>

      <section class="card chips-card">
        <div class="chip-row" role="tablist" aria-label="Grocery sections">
          <button
            class="chip-button ${selectedSection === "all" ? "chip-active" : ""}"
            type="button"
            data-action="set-grocery-section"
            data-section-id="all"
          >
            All sections
          </button>
          ${itemsBySection
            .map(
              (section) => `
                <button
                  class="chip-button ${selectedSection === section.id ? "chip-active" : ""}"
                  type="button"
                  data-action="set-grocery-section"
                  data-section-id="${section.id}"
                >
                  ${section.title}
                </button>
              `
            )
            .join("")}
        </div>
      </section>

      <div class="groceries-sections">
        ${visibleSections
          .map((section) => {
            const claimedInSection = section.items.filter((item) => {
              const claimGuestId = item.lockedClaimBy ?? sharedGroceries.claims[item.itemId];
              return Boolean(claimGuestId);
            }).length;

            return `
              <section class="card grocery-section">
                <div class="grocery-section-header">
                  <div>
                    <p class="section-kicker">${section.source}</p>
                    <h3>${section.title}</h3>
                    <p class="muted">${section.subtitle}</p>
                  </div>
                  <div class="grocery-section-meta">
                    <span>${section.items.length} items</span>
                    <span>${claimedInSection} claimed</span>
                  </div>
                </div>

                <div class="grocery-items-grid">
                  ${section.items
                    .map((item) => {
                      const claimGuestId = item.lockedClaimBy ?? sharedGroceries.claims[item.itemId];
                      const claimGuest = claimGuestId ? getGuestById(claimGuestId) : null;
                      const payHelpers = sharedGroceries.payHelpers[item.itemId] ?? [];
                      const hasCurrentGuestHelper = payHelpers.includes(guest.id);
                      const editRequests = sharedGroceries.editRequests[item.itemId] ?? [];
                      const isClaimedByCurrentGuest = claimGuestId === guest.id;
                      const isLocked = Boolean(item.lockedClaimBy);
                      const isExpanded = expandedItemId === item.itemId;
                      const statusLabel = isLocked
                        ? `Assigned to ${claimGuest?.displayName ?? "Guest"}`
                        : claimGuest
                          ? `Claimed by ${claimGuest.displayName}`
                          : "Open to claim";

                      return `
                        <article class="grocery-item-card ${claimGuestId ? "grocery-item-claimed" : "grocery-item-open"} ${isLocked ? "grocery-item-locked" : ""}">
                          <div class="grocery-item-top">
                            <div class="grocery-item-copy">
                              <h4>${item.label}</h4>
                              <p class="muted">
                                ${item.defaultSource || "Source TBD"}
                                ${item.budgetNote ? ` · ${item.budgetNote}` : ""}
                              </p>
                            </div>
                            <span class="status-pill ${claimGuestId ? "status-pill-active" : ""}">${statusLabel}</span>
                          </div>

                          <div class="grocery-item-footer">
                            <div class="grocery-actions">
                              <button
                                class="button ${claimGuestId ? "button-secondary" : "button-primary"}"
                                data-action="${isClaimedByCurrentGuest ? "unclaim-grocery" : "claim-grocery"}"
                                data-item-id="${item.itemId}"
                                ${isLocked || (!!claimGuestId && !isClaimedByCurrentGuest) ? "disabled" : ""}
                              >
                                ${isLocked ? "Assigned" : isClaimedByCurrentGuest ? "Release" : "Bring it"}
                              </button>
                              <button
                                class="button button-secondary"
                                data-action="toggle-pay"
                                data-item-id="${item.itemId}"
                              >
                                ${hasCurrentGuestHelper ? "Undo pay help" : "Help pay"}
                              </button>
                              <button
                                class="button button-ghost"
                                type="button"
                                data-action="toggle-grocery-details"
                                data-item-id="${item.itemId}"
                                aria-expanded="${isExpanded ? "true" : "false"}"
                              >
                                ${isExpanded ? "Hide details" : `Details${editRequests.length ? ` (${editRequests.length})` : ""}`}
                              </button>
                            </div>

                            <div class="helper-strip">
                              <span>Pay helpers</span>
                              <strong>${payHelpers.length ? payHelpers.map((helperId) => getGuestById(helperId)?.displayName ?? "Guest").join(", ") : "None yet"}</strong>
                            </div>
                          </div>

                          ${
                            isExpanded
                              ? `
                                <div class="grocery-item-details">
                                  <form class="inline-form" data-form="edit-grocery-request">
                                    <input type="hidden" name="itemId" value="${item.itemId}" />
                                    <label class="field">
                                      <span>Add note or change request</span>
                                      <textarea name="note" rows="2" placeholder="Brand swap, quantity change, or note for Kyle"></textarea>
                                    </label>
                                    <button class="button button-secondary" type="submit">Send request</button>
                                  </form>

                                  ${
                                    editRequests.length
                                      ? `
                                        <div class="request-history">
                                          <span class="label">Existing requests</span>
                                          <ul class="compact-list">
                                            ${editRequests
                                              .map((request) => `<li><strong>${getGuestById(request.guestId)?.displayName ?? "Guest"}:</strong> ${request.note}</li>`)
                                              .join("")}
                                          </ul>
                                        </div>
                                      `
                                      : ""
                                  }
                                </div>
                              `
                              : ""
                          }
                        </article>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>

      <section class="card add-card">
        <div class="section-block-head">
          <div>
            <p class="section-kicker">Add something new</p>
            <h3>Guest item suggestion</h3>
          </div>
          <p class="muted">Add missing items without turning the main board into a wall of form fields.</p>
        </div>
        <form class="inline-form two-col" data-form="add-grocery-item">
          <label class="field">
            <span>Section</span>
            <select name="section" required>
              ${grocerySections.map((section) => `<option value="${section.id}">${section.title}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Item</span>
            <input type="text" name="label" required placeholder="Example: Extra salsa" />
          </label>
          <label class="field field-span">
            <span>Note for Kyle</span>
            <textarea name="note" rows="2" placeholder="Why this item matters, quantity, or preferred store"></textarea>
          </label>
          <button class="button button-primary" type="submit">Add item</button>
        </form>
      </section>
    </section>
  `;
}
