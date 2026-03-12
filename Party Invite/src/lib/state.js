const LOCAL_STATE_KEY = "ttrpg-invite-local-state-v1";

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function loadLocalState() {
  const storedState = safeParse(window.localStorage.getItem(LOCAL_STATE_KEY), {});
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const launchMode = window.location.protocol === "file:" ? "file" : "web";
  const introStageMap = {
    scene: "landing",
    "envelope-arrival": "scroll-reveal",
    "envelope-open": "scroll-reveal",
    "name-select": "landing",
    "personalized-invite": "personalized-card"
  };
  const normalizedIntroStage = introStageMap[storedState.introStage] ?? storedState.introStage;

  return {
    guestId: storedState.guestId ?? null,
    selectedGuestId: storedState.selectedGuestId ?? storedState.guestId ?? null,
    introStage:
      storedState.guestId
        ? "dashboard"
        : normalizedIntroStage ?? "landing",
    currentTab: storedState.currentTab ?? "my-info",
    motionEnabled: storedState.motionEnabled ?? !prefersReducedMotion,
    launchMode,
    syncCapability:
      launchMode === "file"
        ? "local-only"
        : storedState.syncCapability ?? "hosted-optional",
    syncMode: storedState.syncMode ?? "local",
    syncNotice: storedState.syncNotice ?? "",
    syncError: storedState.syncError ?? "",
    lastSyncedAt: storedState.lastSyncedAt ?? null,
    filters: {
      activityCategory: storedState.filters?.activityCategory ?? "All",
      activityQuery: storedState.filters?.activityQuery ?? "",
      activityLocations: Array.isArray(storedState.filters?.activityLocations)
        ? storedState.filters.activityLocations
        : [],
      activityTravelTimes: Array.isArray(storedState.filters?.activityTravelTimes)
        ? storedState.filters.activityTravelTimes
        : [],
      activityDurations: Array.isArray(storedState.filters?.activityDurations)
        ? storedState.filters.activityDurations
        : [],
      activityCosts: Array.isArray(storedState.filters?.activityCosts)
        ? storedState.filters.activityCosts
        : [],
      activityEnergies: Array.isArray(storedState.filters?.activityEnergies)
        ? storedState.filters.activityEnergies
        : [],
      grocerySection: storedState.filters?.grocerySection ?? "all"
    },
    ui: {
      expandedGroceryItemId: storedState.ui?.expandedGroceryItemId ?? null,
      utilityRailCollapsed: storedState.ui?.utilityRailCollapsed ?? false
    },
    shared: {
      groceries: {
        claims: {
          ...(storedState.shared?.groceries?.claims ?? {})
        },
        payHelpers: {
          ...(storedState.shared?.groceries?.payHelpers ?? {})
        },
        editRequests: {
          ...(storedState.shared?.groceries?.editRequests ?? {})
        },
        additions: [...(storedState.shared?.groceries?.additions ?? [])]
      },
      activities: {
        votes: {
          ...(storedState.shared?.activities?.votes ?? {})
        },
        suggestions: [...(storedState.shared?.activities?.suggestions ?? [])]
      },
      guestDetails: {
        ...(storedState.shared?.guestDetails ?? {})
      }
    }
  };
}

export function persistLocalState(state) {
  window.localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
}
