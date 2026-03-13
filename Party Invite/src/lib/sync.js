import { activities } from "../data/activities.js";
import { groceries } from "../data/groceries.js";
import { getGuestById } from "../data/guests.js";

const SHARED_CACHE_KEY = "ttrpg-shared-cache-v1";
const PENDING_MUTATIONS_KEY = "ttrpg-shared-pending-mutations-v1";
const BACKFILL_COMPLETED_KEY = "ttrpg-shared-backfill-completed-v1";
const ENV = (() => {
  try {
    return import.meta.env ?? {};
  } catch {
    return {};
  }
})();

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

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDefaultSharedState() {
  return {
    groceries: {
      claims: {},
      payHelpers: {},
      editRequests: {},
      additions: []
    },
    activities: {
      votes: {},
      suggestions: []
    },
    guestDetails: {}
  };
}

function loadSharedCache() {
  return safeParse(window.localStorage.getItem(SHARED_CACHE_KEY), getDefaultSharedState());
}

function saveSharedCache(sharedState) {
  window.localStorage.setItem(SHARED_CACHE_KEY, JSON.stringify(sharedState));
}

function loadPendingMutations() {
  return safeParse(window.localStorage.getItem(PENDING_MUTATIONS_KEY), []);
}

function savePendingMutations(mutations) {
  if (!mutations.length) {
    window.localStorage.removeItem(PENDING_MUTATIONS_KEY);
    return;
  }

  window.localStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(mutations));
}

function queuePendingMutation(type, payload) {
  const queued = mergePendingMutations(loadPendingMutations(), [{ type, payload }]);
  savePendingMutations(queued);
  return queued.length;
}

function hasCompletedBackfill() {
  return window.localStorage.getItem(BACKFILL_COMPLETED_KEY) === "true";
}

function markBackfillCompleted() {
  window.localStorage.setItem(BACKFILL_COMPLETED_KEY, "true");
}

function getRuntimeConfig() {
  if (typeof window === "undefined") {
    return {};
  }

  return window.PARTY_INVITE_CONFIG && typeof window.PARTY_INVITE_CONFIG === "object"
    ? window.PARTY_INVITE_CONFIG
    : {};
}

function getConfigValue(runtimeKey, envKey) {
  const runtimeValue = getRuntimeConfig()[runtimeKey];
  if (typeof runtimeValue === "string") {
    const trimmed = runtimeValue.trim();
    if (trimmed) {
      return trimmed;
    }
  } else if (runtimeValue) {
    return runtimeValue;
  }

  return ENV[envKey];
}

function getConfiguredAppsScriptUrl() {
  return getConfigValue("appsScriptUrl", "VITE_APPS_SCRIPT_URL");
}

function createMutationId(type) {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${type}-${randomPart}`;
}

function enrichPayload(type, payload) {
  const guest = payload.guestId ? getGuestById(payload.guestId) : null;

  return {
    ...payload,
    mutationId: payload.mutationId ?? createMutationId(type),
    guestName: payload.guestName ?? guest?.displayName ?? "Guest",
    pageUrl: payload.pageUrl ?? window.location.href,
    submittedAt: payload.submittedAt ?? new Date().toISOString(),
    source: payload.source ?? "party-invite"
  };
}

function getMutationKey(entry) {
  if (entry.payload?.mutationId) {
    return entry.payload.mutationId;
  }

  return `${entry.type}:${JSON.stringify(entry.payload)}`;
}

function mergePendingMutations(...groups) {
  const merged = [];
  const seen = new Set();

  for (const group of groups) {
    for (const entry of group) {
      if (!entry?.type || !entry.payload) {
        continue;
      }

      const key = getMutationKey(entry);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      merged.push(entry);
    }
  }

  return merged;
}

function makeEntry(type, payload) {
  return {
    type,
    payload: enrichPayload(type, payload)
  };
}

function getComparableKey(record, fields) {
  return fields
    .map((field) => {
      const value = record?.[field];
      return `${field}:${typeof value === "string" ? value : JSON.stringify(value)}`;
    })
    .join("|");
}

function createBackfillMutations(localSharedState, remoteSharedState) {
  const mutations = [];
  const local = reconcileSharedState(localSharedState);
  const remote = reconcileSharedState(remoteSharedState);

  for (const [itemId, guestId] of Object.entries(local.groceries.claims ?? {})) {
    if (!guestId || remote.groceries.claims[itemId]) {
      continue;
    }

    mutations.push(
      makeEntry("claimGrocery", {
        guestId,
        itemId,
        action: "claim",
        source: "cached-backfill"
      })
    );
  }

  for (const [itemId, helperIds] of Object.entries(local.groceries.payHelpers ?? {})) {
    const remoteHelpers = new Set(remote.groceries.payHelpers[itemId] ?? []);

    for (const guestId of helperIds ?? []) {
      if (!guestId || remoteHelpers.has(guestId)) {
        continue;
      }

      mutations.push(
        makeEntry("groceryContribution", {
          guestId,
          itemId,
          helpingPay: true,
          source: "cached-backfill"
        })
      );
    }
  }

  for (const [itemId, requests] of Object.entries(local.groceries.editRequests ?? {})) {
    const remoteKeys = new Set(
      (remote.groceries.editRequests[itemId] ?? []).map((request) =>
        getComparableKey(request, ["guestId", "note", "createdAt"])
      )
    );

    for (const request of requests ?? []) {
      const key = getComparableKey(request, ["guestId", "note", "createdAt"]);
      if (remoteKeys.has(key) || !request?.guestId || !request?.note) {
        continue;
      }

      mutations.push(
        makeEntry("groceryEditRequest", {
          guestId: request.guestId,
          itemId,
          note: request.note,
          submittedAt: request.createdAt,
          source: "cached-backfill"
        })
      );
    }
  }

  const remoteAdditions = new Set(
    (remote.groceries.additions ?? []).map((item) =>
      getComparableKey(item, ["section", "label", "note", "createdBy", "createdAt"])
    )
  );

  for (const item of local.groceries.additions ?? []) {
    const key = getComparableKey(item, ["section", "label", "note", "createdBy", "createdAt"]);
    if (remoteAdditions.has(key) || !item?.createdBy || !item?.label) {
      continue;
    }

    mutations.push(
      makeEntry("addGroceryItem", {
        guestId: item.createdBy,
        section: item.section,
        label: item.label,
        note: item.note ?? "",
        submittedAt: item.createdAt,
        source: "cached-backfill"
      })
    );
  }

  for (const [activityId, voterIds] of Object.entries(local.activities.votes ?? {})) {
    const remoteVoters = new Set(remote.activities.votes[activityId] ?? []);

    for (const guestId of voterIds ?? []) {
      if (!guestId || remoteVoters.has(guestId)) {
        continue;
      }

      mutations.push(
        makeEntry("voteActivity", {
          guestId,
          activityId,
          source: "cached-backfill"
        })
      );
    }
  }

  const remoteSuggestions = new Set(
    (remote.activities.suggestions ?? []).map((activity) =>
      getComparableKey(activity, ["title", "category", "description", "createdBy", "createdAt"])
    )
  );

  for (const activity of local.activities.suggestions ?? []) {
    const description = activity.note || activity.description || "";
    const key = getComparableKey(
      {
        title: activity.title,
        category: activity.category,
        description,
        createdBy: activity.createdBy,
        createdAt: activity.createdAt
      },
      ["title", "category", "description", "createdBy", "createdAt"]
    );

    if (remoteSuggestions.has(key) || !activity?.createdBy || !activity?.title) {
      continue;
    }

    mutations.push(
      makeEntry("suggestActivity", {
        guestId: activity.createdBy,
        title: activity.title,
        category: activity.category,
        note: description,
        submittedAt: activity.createdAt,
        source: "cached-backfill"
      })
    );
  }

  for (const [guestId, details] of Object.entries(local.guestDetails ?? {})) {
    const remoteDetails = remote.guestDetails[guestId];
    const localUpdatedAt = Date.parse(details?.updatedAt ?? "") || 0;
    const remoteUpdatedAt = Date.parse(remoteDetails?.updatedAt ?? "") || 0;

    if (!guestId || localUpdatedAt <= remoteUpdatedAt) {
      continue;
    }

    mutations.push(
      makeEntry("saveGuestDetails", {
        guestId,
        dietaryFlags: details.dietaryFlags ?? [],
        dietaryNotes: details.dietaryNotes ?? "",
        allergyNotes: details.allergyNotes ?? "",
        messageToKyle: details.messageToKyle ?? "",
        submittedAt: details.updatedAt,
        source: "cached-backfill"
      })
    );
  }

  return mutations;
}

async function flushPendingMutations(request, initialSharedState, pendingMutations) {
  let sharedState = reconcileSharedState(initialSharedState);
  const remaining = [];
  let flushedCount = 0;

  for (const entry of pendingMutations) {
    try {
      const result = await request(entry.type, entry.payload, "POST");
      sharedState = reconcileSharedState(result.sharedState ?? sharedState);

      if (String(result.emailStatus ?? "").startsWith("failed")) {
        remaining.push(entry);
        continue;
      }

      flushedCount += 1;
    } catch {
      remaining.push(entry);
    }
  }

  return {
    sharedState,
    flushedCount,
    remaining
  };
}

function mergeSharedState(sharedState) {
  return {
    groceries: {
      claims: {
        ...sharedState.groceries?.claims
      },
      payHelpers: {
        ...sharedState.groceries?.payHelpers
      },
      editRequests: {
        ...sharedState.groceries?.editRequests
      },
      additions: [...(sharedState.groceries?.additions ?? [])]
    },
    activities: {
      votes: {
        ...sharedState.activities?.votes
      },
      suggestions: [...(sharedState.activities?.suggestions ?? [])]
    },
    guestDetails: {
      ...sharedState.guestDetails
    }
  };
}

function normalizeActivityVotes(votes) {
  const normalized = {};

  for (const activity of activities) {
    normalized[activity.activityId] = Array.isArray(votes?.[activity.activityId])
      ? votes[activity.activityId]
      : [];
  }

  return normalized;
}

function normalizePayHelpers(payHelpers) {
  const normalized = {};

  for (const item of groceries) {
    normalized[item.itemId] = Array.isArray(payHelpers?.[item.itemId])
      ? payHelpers[item.itemId]
      : [];
  }

  return normalized;
}

function normalizeEditRequests(editRequests) {
  const normalized = {};

  for (const item of groceries) {
    normalized[item.itemId] = Array.isArray(editRequests?.[item.itemId])
      ? editRequests[item.itemId]
      : [];
  }

  return normalized;
}

export function reconcileSharedState(sharedState) {
  const merged = mergeSharedState({
    ...getDefaultSharedState(),
    ...sharedState
  });

  merged.activities.votes = normalizeActivityVotes(merged.activities.votes);
  merged.groceries.payHelpers = normalizePayHelpers(merged.groceries.payHelpers);
  merged.groceries.editRequests = normalizeEditRequests(merged.groceries.editRequests);

  for (const item of groceries) {
    if (item.lockedClaimBy) {
      merged.groceries.claims[item.itemId] = item.lockedClaimBy;
    }
  }

  return merged;
}

function applyMutation(sharedState, type, payload) {
  const next = deepClone(reconcileSharedState(sharedState));

  switch (type) {
    case "claimGrocery": {
      const { guestId, itemId, action } = payload;
      if (action === "unclaim") {
        if (next.groceries.claims[itemId] === guestId) {
          delete next.groceries.claims[itemId];
        }
        return next;
      }

      if (next.groceries.claims[itemId] && next.groceries.claims[itemId] !== guestId) {
        throw new Error("That item is already claimed by someone else.");
      }

      next.groceries.claims[itemId] = guestId;
      return next;
    }

    case "groceryContribution": {
      const { guestId, itemId, helpingPay } = payload;
      const helpers = new Set(next.groceries.payHelpers[itemId] ?? []);

      if (helpingPay) {
        helpers.add(guestId);
      } else {
        helpers.delete(guestId);
      }

      next.groceries.payHelpers[itemId] = [...helpers];
      return next;
    }

    case "groceryEditRequest": {
      const { guestId, itemId, note } = payload;
      next.groceries.editRequests[itemId].push({
        guestId,
        note,
        createdAt: new Date().toISOString()
      });
      return next;
    }

    case "addGroceryItem": {
      const { guestId, section, label, note } = payload;
      next.groceries.additions.unshift({
        itemId: `guest-${Date.now()}`,
        section,
        label,
        note,
        guestAdded: true,
        createdBy: guestId,
        createdAt: new Date().toISOString(),
        defaultSource: "Guest suggestion",
        budgetNote: ""
      });
      return next;
    }

    case "voteActivity": {
      const { guestId, activityId } = payload;
      const voters = new Set(next.activities.votes[activityId] ?? []);
      if (voters.has(guestId)) {
        throw new Error("You already voted for that activity.");
      }
      voters.add(guestId);
      next.activities.votes[activityId] = [...voters];
      return next;
    }

    case "suggestActivity": {
      const { guestId, title, category, note } = payload;
      next.activities.suggestions.unshift({
        activityId: `suggested-${Date.now()}`,
        title,
        category,
        subtype: "Guest suggestion",
        location: "TBD",
        driveTime: "TBD",
        cost: "TBD",
        energy: "Unknown",
        description: note || "Guest-suggested activity",
        voteable: true,
        featured: false,
        createdBy: guestId,
        createdAt: new Date().toISOString()
      });
      return next;
    }

    case "saveGuestDetails": {
      const { guestId, dietaryFlags, dietaryNotes, allergyNotes, messageToKyle } = payload;
      next.guestDetails[guestId] = {
        dietaryFlags,
        dietaryNotes,
        allergyNotes,
        messageToKyle,
        updatedAt: new Date().toISOString()
      };
      return next;
    }

    default:
      return next;
  }
}

function getConfiguredMode() {
  if (window.location.protocol === "file:") {
    return "local";
  }

  const forcedMode = getConfigValue("syncMode", "VITE_SYNC_MODE");
  if (forcedMode) {
    return forcedMode;
  }

  if (getConfiguredAppsScriptUrl()) {
    return "apps-script";
  }

  return "local";
}

function createAppsScriptClient(baseUrl) {
  async function request(action, payload = {}, method = "POST") {
    const requestUrl =
      method === "GET"
        ? `${baseUrl}?action=${encodeURIComponent(action)}`
        : baseUrl;

    const response = await fetch(requestUrl, {
      method,
      body: method === "GET" ? undefined : JSON.stringify({ action, ...payload })
    });

    if (!response.ok) {
      throw new Error(`Sync request failed (${response.status})`);
    }

    return response.json();
  }

  return {
    mode: "apps-script",
    async bootstrap() {
      const localSharedState = reconcileSharedState(loadSharedCache());
      const result = await request("bootstrap", {}, "GET");
      let sharedState = reconcileSharedState(result.sharedState ?? getDefaultSharedState());
      let pendingMutations = loadPendingMutations();

      if (!hasCompletedBackfill()) {
        pendingMutations = mergePendingMutations(
          createBackfillMutations(localSharedState, sharedState),
          pendingMutations
        );
        savePendingMutations(pendingMutations);
        markBackfillCompleted();
      }

      let flushedCount = 0;
      if (pendingMutations.length) {
        const flushResult = await flushPendingMutations(request, sharedState, pendingMutations);
        sharedState = flushResult.sharedState;
        flushedCount = flushResult.flushedCount;
        savePendingMutations(flushResult.remaining);
        pendingMutations = flushResult.remaining;
      }

      saveSharedCache(sharedState);

      return {
        mode: "apps-script",
        sharedState,
        flushedCount,
        pendingCount: pendingMutations.length
      };
    },
    async mutate(type, payload, optimisticSharedState) {
      const enrichedPayload = enrichPayload(type, payload);
      const sharedState = reconcileSharedState(optimisticSharedState);

      try {
        const result = await request(type, enrichedPayload, "POST");
        const nextSharedState = reconcileSharedState(result.sharedState ?? optimisticSharedState);
        const emailFailed = String(result.emailStatus ?? "").startsWith("failed");

        if (emailFailed) {
          const pendingCount = queuePendingMutation(type, enrichedPayload);
          saveSharedCache(nextSharedState);

          return {
            sharedState: nextSharedState,
            queued: true,
            pendingCount,
            queuedMessage: "Saved and queued. We'll keep retrying until the email goes through."
          };
        }

        saveSharedCache(nextSharedState);
        return { sharedState: nextSharedState };
      } catch (error) {
        saveSharedCache(sharedState);
        const pendingCount = queuePendingMutation(type, enrichedPayload);

        return {
          sharedState,
          queued: true,
          pendingCount,
          queuedMessage: "Saved on this device. We'll retry live sync automatically.",
          queueReason: error.message
        };
      }
    }
  };
}

function createLocalClient() {
  return {
    mode: "local",
    async bootstrap() {
      const sharedState = reconcileSharedState(loadSharedCache());
      saveSharedCache(sharedState);
      return {
        mode: "local",
        sharedState
      };
    },
    async mutate(type, payload, optimisticSharedState) {
      const sharedState = reconcileSharedState(
        applyMutation(optimisticSharedState, type, payload)
      );
      saveSharedCache(sharedState);
      return { sharedState };
    }
  };
}

export function createSyncClient() {
  const mode = getConfiguredMode();
  const appsScriptUrl = getConfiguredAppsScriptUrl();

  if (mode === "apps-script" && appsScriptUrl) {
    return createAppsScriptClient(appsScriptUrl);
  }

  return createLocalClient();
}

export function applyOptimisticMutation(sharedState, type, payload) {
  return reconcileSharedState(applyMutation(sharedState, type, payload));
}
