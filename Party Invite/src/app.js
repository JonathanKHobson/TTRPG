import confetti from "canvas-confetti";
import { eventContent } from "./data/content.js";
import { getGuestById } from "./data/guests.js";
import { renderDashboardView } from "./views/dashboardView.js";
import { renderSplashView } from "./views/splashView.js";
import { loadLocalState, persistLocalState } from "./lib/state.js";
import {
  applyOptimisticMutation,
  createSyncClient,
  reconcileSharedState
} from "./lib/sync.js";
import { fetchFlightStatus, flightStatusKey } from "./lib/flightStatus.js";

function serializeForm(form) {
  return new FormData(form);
}

function fireCelebration() {
  confetti({
    particleCount: 110,
    spread: 90,
    startVelocity: 24,
    origin: { y: 0.68 }
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

const ACTIVITY_FILTER_GROUPS = {
  location: "activityLocations",
  travel: "activityTravelTimes",
  duration: "activityDurations",
  cost: "activityCosts",
  energy: "activityEnergies"
};

const EMPTY_ACTIVITY_FILTERS = {
  activityCategory: "All",
  activityQuery: "",
  activityLocations: [],
  activityTravelTimes: [],
  activityDurations: [],
  activityCosts: [],
  activityEnergies: []
};

export async function initApp(root) {
  const syncClient = createSyncClient();
  let state = { ...loadLocalState(), flightStatuses: {} };
  let stageTimer = null;
  let noticeTimer = null;

  function clearStageTimer() {
    if (stageTimer) {
      window.clearTimeout(stageTimer);
      stageTimer = null;
    }
  }

  function clearNoticeTimer() {
    if (noticeTimer) {
      window.clearTimeout(noticeTimer);
      noticeTimer = null;
    }
  }

  function commit(nextState) {
    state = nextState;
    persistLocalState(state);
    render();
  }

  function patch(partial) {
    commit({
      ...state,
      ...partial
    });
  }

  function patchActivityFilters(partial) {
    patch({
      filters: {
        ...state.filters,
        ...partial
      }
    });
  }

  function syncActivityFilterForm(form) {
    const data = serializeForm(form);
    patchActivityFilters({
      activityCategory: String(data.get("activityCategory") ?? "All"),
      activityQuery: String(data.get("activityQuery") ?? "")
    });
  }

  function toggleActivityFilter(filterKey, value) {
    const currentValues = state.filters[filterKey] ?? [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    patchActivityFilters({
      [filterKey]: nextValues
    });
  }

  function queueStagePatch(partial, delayMs) {
    clearStageTimer();
    stageTimer = window.setTimeout(() => {
      stageTimer = null;
      patch(partial);
    }, delayMs);
  }

  function setEphemeralNotice(message, delayMs = 2200) {
    clearNoticeTimer();
    patch({ syncNotice: message });
    noticeTimer = window.setTimeout(() => {
      noticeTimer = null;
      patch({ syncNotice: "" });
    }, delayMs);
  }

  function updateShared(sharedState, extra = {}) {
    commit({
      ...state,
      ...extra,
      shared: reconcileSharedState(sharedState)
    });
  }

  function getSelectedGuest() {
    return getGuestById(state.selectedGuestId) ?? getGuestById(state.guestId) ?? null;
  }

  function getContext() {
    return {
      state,
      guest: getGuestById(state.guestId) ?? getSelectedGuest(),
      selectedGuest: getSelectedGuest()
    };
  }

  async function loadFlightStatuses(flight) {
    if (!flight) return;
    const legs = [
      flight.inbound,
      flight.outbound
    ].filter(Boolean);

    for (const leg of legs) {
      const lookupNumber = leg.flightNumberIata ?? leg.flightNumber;
      const key = flightStatusKey(lookupNumber, leg.date);
      const result = await fetchFlightStatus(lookupNumber, leg.date);
      patch({ flightStatuses: { ...state.flightStatuses, [key]: result } });
    }
  }

  function maybeLoadFlightStatuses() {
    const guest = getGuestById(state.guestId);
    if (state.introStage === "dashboard" && state.currentTab === "my-info" && guest?.flight) {
      loadFlightStatuses(guest.flight);
    }
  }

  function render() {
    const context = getContext();
    root.innerHTML =
      state.guestId && state.introStage === "dashboard"
        ? renderDashboardView(context)
        : renderSplashView(context);
  }

  async function bootstrap() {
    try {
      const result = await syncClient.bootstrap();
      const syncNotice =
        result.flushedCount && result.pendingCount
          ? `Recovered ${result.flushedCount} cached updates. ${result.pendingCount} still waiting to sync.`
          : result.flushedCount
            ? `Recovered ${result.flushedCount} cached updates.`
            : result.pendingCount
              ? `${result.pendingCount} cached updates are still waiting to sync.`
              : "";

      commit({
        ...state,
        syncMode: result.mode,
        syncNotice,
        syncError: "",
        lastSyncedAt: new Date().toISOString(),
        shared: result.sharedState
      });
    } catch (error) {
      commit({
        ...state,
        syncMode: "local",
        syncError: `Sync bootstrap failed. Using this device's saved data instead. ${error.message}`,
        shared: reconcileSharedState(state.shared)
      });
    }
  }

  async function mutateShared(type, payload, successMessage) {
    const optimisticSharedState = applyOptimisticMutation(state.shared, type, payload);
    const previousSharedState = state.shared;

    updateShared(optimisticSharedState, {
      syncError: ""
    });

    try {
      const result = await syncClient.mutate(type, payload, optimisticSharedState);

      if (result.queued) {
        updateShared(result.sharedState, {
          syncError: "",
          syncNotice: ""
        });
        setEphemeralNotice(result.queuedMessage);
        return;
      }

      updateShared(result.sharedState, {
        syncError: "",
        lastSyncedAt: new Date().toISOString(),
        syncNotice: ""
      });
      if (successMessage) {
        setEphemeralNotice(successMessage);
      }
    } catch (error) {
      updateShared(previousSharedState, {
        syncError: error.message
      });
    }
  }

  root.addEventListener("click", async (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      return;
    }

    const action = actionTarget.dataset.action;

    if (action === "change-name") {
      clearStageTimer();
      patch({
        introStage: "landing"
      });
      return;
    }

    if (action === "accept-invitation") {
      if (!state.selectedGuestId) {
        return;
      }

      clearStageTimer();

      if (state.motionEnabled) {
        fireCelebration();
        patch({ introStage: "dashboard-transition" });
        queueStagePatch(
          {
            guestId: state.selectedGuestId,
            introStage: "dashboard"
          },
          650
        );
      } else {
        patch({
          guestId: state.selectedGuestId,
          introStage: "dashboard"
        });
      }
      return;
    }

    if (action === "switch-guest") {
      clearStageTimer();
      patch({
        guestId: null,
        selectedGuestId: state.guestId,
        introStage: "landing",
        currentTab: "my-info"
      });
      return;
    }

    if (action === "copy-address") {
      try {
        await copyText(eventContent.address.full);
        setEphemeralNotice("Address copied.");
      } catch {
        setEphemeralNotice("Couldn't copy the address. You can still copy it manually.");
      }
      return;
    }

    if (action === "set-tab") {
      const newTab = actionTarget.dataset.tabId;
      patch({
        currentTab: newTab,
        ui: {
          ...state.ui,
          expandedGroceryItemId: newTab === "groceries" ? state.ui.expandedGroceryItemId : null
        }
      });
      if (newTab === "my-info") {
        const guest = getGuestById(state.guestId);
        if (guest?.flight) loadFlightStatuses(guest.flight);
      }
      return;
    }

    if (action === "toggle-utility-rail") {
      patch({
        ui: {
          ...state.ui,
          utilityRailCollapsed: !state.ui.utilityRailCollapsed
        }
      });
      return;
    }

    if (action === "set-grocery-section") {
      patchActivityFilters({
        grocerySection: actionTarget.dataset.sectionId ?? "all"
      });
      return;
    }

    if (action === "toggle-activity-filter") {
      const filterKey = ACTIVITY_FILTER_GROUPS[actionTarget.dataset.filterGroup];
      const value = actionTarget.dataset.filterValue;

      if (!filterKey || !value) {
        return;
      }

      toggleActivityFilter(filterKey, value);
      return;
    }

    if (action === "clear-activity-filters") {
      patchActivityFilters(EMPTY_ACTIVITY_FILTERS);
      return;
    }

    if (action === "toggle-grocery-details") {
      const itemId = actionTarget.dataset.itemId;
      patch({
        ui: {
          ...state.ui,
          expandedGroceryItemId: state.ui.expandedGroceryItemId === itemId ? null : itemId
        }
      });
      return;
    }

    if (action === "claim-grocery") {
      await mutateShared(
        "claimGrocery",
        {
          guestId: state.guestId,
          itemId: actionTarget.dataset.itemId,
          action: "claim"
        },
        "Claim updated."
      );
      return;
    }

    if (action === "unclaim-grocery") {
      await mutateShared(
        "claimGrocery",
        {
          guestId: state.guestId,
          itemId: actionTarget.dataset.itemId,
          action: "unclaim"
        },
        "Claim released."
      );
      return;
    }

    if (action === "toggle-pay") {
      const itemId = actionTarget.dataset.itemId;
      const helpers = state.shared.groceries.payHelpers[itemId] ?? [];
      const helpingPay = !helpers.includes(state.guestId);

      await mutateShared(
        "groceryContribution",
        {
          guestId: state.guestId,
          itemId,
          helpingPay
        },
        helpingPay ? "Marked as helping pay." : "Removed pay helper."
      );
      return;
    }

    if (action === "vote-activity") {
      await mutateShared(
        "voteActivity",
        {
          guestId: state.guestId,
          activityId: actionTarget.dataset.activityId
        },
        "Vote submitted."
      );
    }
  });

  root.addEventListener("submit", async (event) => {
    const form = event.target;
    const formName = form.dataset.form;
    if (!formName) {
      return;
    }

    event.preventDefault();
    const data = serializeForm(form);

    if (formName === "issue-scroll") {
      const selectedGuestId = String(data.get("guestId") ?? "");
      if (!selectedGuestId) {
        return;
      }

      clearStageTimer();

      if (state.motionEnabled) {
        patch({
          selectedGuestId,
          introStage: "scroll-reveal"
        });
        queueStagePatch(
          {
            selectedGuestId,
            introStage: "personalized-card"
          },
          950
        );
      } else {
        patch({
          selectedGuestId,
          introStage: "personalized-card"
        });
      }
      return;
    }

    if (formName === "edit-grocery-request") {
      const note = String(data.get("note") ?? "").trim();
      if (!note) {
        return;
      }

      await mutateShared(
        "groceryEditRequest",
        {
          guestId: state.guestId,
          itemId: data.get("itemId"),
          note
        },
        "Edit request sent."
      );
      form.reset();
      return;
    }

    if (formName === "add-grocery-item") {
      const label = String(data.get("label") ?? "").trim();
      if (!label) {
        return;
      }

      await mutateShared(
        "addGroceryItem",
        {
          guestId: state.guestId,
          section: data.get("section"),
          label,
          note: String(data.get("note") ?? "").trim()
        },
        "Item added."
      );
      form.reset();
      return;
    }

    if (formName === "suggest-activity") {
      const title = String(data.get("title") ?? "").trim();
      if (!title) {
        return;
      }

      await mutateShared(
        "suggestActivity",
        {
          guestId: state.guestId,
          title,
          category: data.get("category"),
          note: String(data.get("note") ?? "").trim()
        },
        "Activity suggestion added."
      );
      form.reset();
      return;
    }

    if (formName === "save-guest-details") {
      await mutateShared(
        "saveGuestDetails",
        {
          guestId: state.guestId,
          dietaryFlags: data.getAll("dietaryFlags"),
          dietaryNotes: String(data.get("dietaryNotes") ?? "").trim(),
          allergyNotes: String(data.get("allergyNotes") ?? "").trim(),
          messageToKyle: String(data.get("messageToKyle") ?? "").trim()
        },
        "Details saved."
      );
      return;
    }

    if (formName === "activity-filters") {
      syncActivityFilterForm(form);
    }
  });

  root.addEventListener("change", (event) => {
    const form = event.target.closest("[data-form='activity-filters']");
    if (!form) {
      return;
    }

    syncActivityFilterForm(form);
  });

  root.addEventListener("input", (event) => {
    const form = event.target.closest("[data-form='activity-filters']");
    if (!form) {
      return;
    }

    syncActivityFilterForm(form);
  });

  render();
  maybeLoadFlightStatuses();
  await bootstrap();
  maybeLoadFlightStatuses();
}
