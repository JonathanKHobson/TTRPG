import {
  activities,
  activityAdvancedFilters,
  activityCategories,
  featuredActivities,
  normalizeActivityForFilters
} from "../data/activities.js";
import { getGuestById } from "../data/guests.js";

const filterGroups = [
  {
    label: "Location",
    optionKey: "location",
    stateKey: "activityLocations"
  },
  {
    label: "Travel time",
    optionKey: "travel",
    stateKey: "activityTravelTimes"
  },
  {
    label: "Activity time",
    optionKey: "duration",
    stateKey: "activityDurations"
  },
  {
    label: "Cost",
    optionKey: "cost",
    stateKey: "activityCosts"
  },
  {
    label: "Intensity",
    optionKey: "energy",
    stateKey: "activityEnergies"
  }
];

function matchesTagGroup(selectedValues, activityValue) {
  if (!selectedValues.length) {
    return true;
  }

  return Boolean(activityValue) && selectedValues.includes(activityValue);
}

function matchesFilters(activity, filters) {
  const category = filters.activityCategory;
  const query = filters.activityQuery;
  const categoryMatch =
    category === "All" ||
    activity.category === category ||
    (category === "Featured" && activity.featured);
  const haystack = [
    activity.title,
    activity.category,
    activity.subtype,
    activity.location,
    activity.description
  ]
    .join(" ")
    .toLowerCase();
  const queryMatch = !query || haystack.includes(query.toLowerCase());

  return (
    categoryMatch &&
    queryMatch &&
    matchesTagGroup(filters.activityLocations, activity.locationGroup) &&
    matchesTagGroup(filters.activityTravelTimes, activity.travelBucket) &&
    matchesTagGroup(filters.activityDurations, activity.durationBucket) &&
    matchesTagGroup(filters.activityCosts, activity.costBucket) &&
    matchesTagGroup(filters.activityEnergies, activity.energyBucket)
  );
}

function renderVoterList(voters) {
  if (!voters.length) {
    return "";
  }

  return `<p class="muted">Voters: ${voters
    .map((voterId) => getGuestById(voterId)?.displayName ?? "Guest")
    .join(", ")}</p>`;
}

function renderFilterChip(group, option, isActive) {
  return `
    <button
      class="chip-button activity-filter-chip ${isActive ? "chip-active" : ""}"
      type="button"
      data-action="toggle-activity-filter"
      data-filter-group="${group.optionKey}"
      data-filter-value="${option}"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      ${option}
    </button>
  `;
}

function renderFilterGroup(group, filters) {
  const selectedValues = filters[group.stateKey] ?? [];

  return `
    <fieldset class="activity-filter-group">
      <legend>${group.label}</legend>
      <div class="chip-row activity-filter-chip-row">
        ${activityAdvancedFilters[group.optionKey]
          .map((option) => renderFilterChip(group, option, selectedValues.includes(option)))
          .join("")}
      </div>
    </fieldset>
  `;
}

function renderActivityMeta(activity) {
  const durationLabel = activity.durationBucket ?? "TBD timing";

  return `
    <div class="meta-strip activity-meta">
      <span>${activity.location}</span>
      <span>${activity.driveTime}</span>
      <span>${durationLabel}</span>
      <span>${activity.cost}</span>
      <span>${activity.energy}</span>
    </div>
  `;
}

function renderRegularActivityCard(activity, guest, voteMap) {
  const voters = voteMap[activity.activityId] ?? [];
  const hasVoted = guest?.id ? voters.includes(guest.id) : false;

  return `
    <article class="card activity-card">
      <div class="activity-header">
        <div class="activity-heading">
          <p class="section-kicker">${activity.category}${activity.subtype ? ` | ${activity.subtype}` : ""}</p>
          <h3>${activity.title}</h3>
        </div>
      </div>
      <p class="activity-copy">${activity.description}</p>
      ${renderActivityMeta(activity)}
      ${
        activity.voteable
          ? `
            <div class="button-row activity-actions">
              <button
                class="button ${hasVoted ? "button-secondary" : "button-primary"}"
                data-action="vote-activity"
                data-activity-id="${activity.activityId}"
                ${hasVoted ? "disabled" : ""}
              >
                ${hasVoted ? "Vote locked" : "Vote"}
              </button>
              <span class="status-line">${voters.length} vote${voters.length === 1 ? "" : "s"}</span>
            </div>
            ${renderVoterList(voters)}
          `
          : `
            <p class="status-line">Confirmed main event</p>
          `
      }
    </article>
  `;
}

function renderFeaturedActivityCard(activity, guest, voteMap) {
  const voters = voteMap[activity.activityId] ?? [];
  const hasVoted = guest?.id ? voters.includes(guest.id) : false;

  return `
    <article class="card activity-featured-card">
      <div class="activity-featured-main">
        <div class="activity-featured-header">
          <div class="activity-heading">
            <p class="section-kicker">${activity.category}${activity.subtype ? ` | ${activity.subtype}` : ""}</p>
            <h3>${activity.title}</h3>
          </div>
          <span class="featured-pill">Featured</span>
        </div>
        <p class="activity-featured-copy">${activity.description}</p>
        ${renderActivityMeta(activity)}
      </div>
      <div class="activity-featured-rail">
        <div class="activity-featured-status">
          <p class="section-kicker">Board status</p>
          ${
            activity.voteable
              ? `
                <strong>${voters.length} vote${voters.length === 1 ? "" : "s"}</strong>
                <p class="muted">Vote for side adventures without affecting the locked-in main session.</p>
              `
              : `
                <strong>Confirmed main event</strong>
                <p class="muted">This is the anchor activity for the gathering and stays pinned at the top.</p>
              `
          }
        </div>
        ${
          activity.voteable
            ? `
              <div class="button-row activity-actions activity-featured-actions">
                <button
                  class="button ${hasVoted ? "button-secondary" : "button-primary"}"
                  data-action="vote-activity"
                  data-activity-id="${activity.activityId}"
                  ${hasVoted ? "disabled" : ""}
                >
                  ${hasVoted ? "Vote locked" : "Vote"}
                </button>
                <span class="status-line">${hasVoted ? "Your vote is counted" : "Open for voting"}</span>
              </div>
              ${renderVoterList(voters)}
            `
            : `
              <p class="status-line">Locked as the main session</p>
            `
        }
      </div>
    </article>
  `;
}

export function renderActivitiesView({ state, guest }) {
  const suggestions = (state.shared.activities.suggestions ?? []).map(normalizeActivityForFilters);
  const voteMap = state.shared.activities.votes ?? {};
  const filters = state.filters;
  const allActivities = [...featuredActivities, ...activities, ...suggestions];
  const filteredActivities = allActivities.filter((activity) => matchesFilters(activity, filters));
  const featuredResults = filteredActivities.filter((activity) => activity.featured);
  const regularResults = filteredActivities.filter((activity) => !activity.featured);
  const hasActiveFilters =
    filters.activityCategory !== "All" ||
    Boolean(filters.activityQuery) ||
    filterGroups.some((group) => (filters[group.stateKey] ?? []).length);

  return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Activities board</p>
          <h2>Vote on what happens around the main event</h2>
          <p class="section-copy">A tighter board for browsing lots of options quickly without losing the event context.</p>
        </div>
        <div class="page-header-side">
          <div class="callout-badge">Primary TTRPG session stays locked in</div>
        </div>
      </header>

      <section class="card filters-card">
        <form class="activity-filters-form" data-form="activity-filters">
          <div class="filters-row">
            <label class="field">
              <span>Category</span>
              <select name="activityCategory">
                ${activityCategories
                  .map(
                    (option) => `
                      <option value="${option}" ${option === filters.activityCategory ? "selected" : ""}>${option}</option>
                    `
                  )
                  .join("")}
              </select>
            </label>
            <label class="field field-grow">
              <span>Search</span>
              <input type="search" name="activityQuery" value="${filters.activityQuery}" placeholder="Search by title, category, location, or vibe" />
            </label>
            <div class="activity-filter-actions">
              <button
                class="button button-secondary"
                type="button"
                data-action="clear-activity-filters"
                ${hasActiveFilters ? "" : "disabled"}
              >
                Clear filters
              </button>
            </div>
          </div>
          <div class="activity-filter-groups">
            ${filterGroups.map((group) => renderFilterGroup(group, filters)).join("")}
          </div>
        </form>
      </section>

      <section class="activities-board">
        ${
          featuredResults.length
            ? `
              <div class="activity-featured-stack">
                ${featuredResults
                  .map((activity) => renderFeaturedActivityCard(activity, guest, voteMap))
                  .join("")}
              </div>
            `
            : ""
        }
        ${
          regularResults.length
            ? `
              <div class="activity-grid">
                ${regularResults
                  .map((activity) => renderRegularActivityCard(activity, guest, voteMap))
                  .join("")}
              </div>
            `
            : ""
        }
        ${
          !filteredActivities.length
            ? `
              <article class="card activity-empty-state">
                <p class="section-kicker">No matches</p>
                <h3>No activities fit that filter</h3>
                <p class="muted">Try another category, search term, or clear the advanced filters to reopen the board.</p>
              </article>
            `
            : ""
        }
      </section>

      <section class="card add-card">
        <div class="section-block-head">
          <div>
            <p class="section-kicker">Suggest something new</p>
            <h3>Add an activity idea</h3>
          </div>
          <p class="muted">Keep new ideas lightweight and easy to scan with the rest of the board.</p>
        </div>
        <form class="inline-form two-col" data-form="suggest-activity">
          <label class="field">
            <span>Activity</span>
            <input type="text" name="title" required placeholder="Example: Desert Botanical Garden at sunset" />
          </label>
          <label class="field">
            <span>Category</span>
            <select name="category" required>
              ${activityCategories
                .filter((option) => option !== "All" && option !== "Featured")
                .map((option) => `<option value="${option}">${option}</option>`)
                .join("")}
            </select>
          </label>
          <label class="field field-span">
            <span>Why it belongs on the board</span>
            <textarea name="note" rows="2" placeholder="Context, location, cost, or why the group would like it"></textarea>
          </label>
          <button class="button button-primary" type="submit">Submit activity</button>
        </form>
      </section>
    </section>
  `;
}
