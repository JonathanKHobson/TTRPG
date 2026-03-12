import emailjs from "@emailjs/browser";
import { activities } from "../data/activities.js";
import { groceries } from "../data/groceries.js";

const SHARED_CACHE_KEY = "ttrpg-shared-cache-v1";
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

  const forcedMode = ENV.VITE_SYNC_MODE;
  if (forcedMode) {
    return forcedMode;
  }

  if (ENV.VITE_APPS_SCRIPT_URL) {
    return "apps-script";
  }

  if (
    ENV.VITE_EMAILJS_PUBLIC_KEY &&
    ENV.VITE_EMAILJS_SERVICE_ID &&
    ENV.VITE_EMAILJS_TEMPLATE_ID
  ) {
    return "emailjs";
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
      headers: {
        "Content-Type": "application/json"
      },
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
      const result = await request("bootstrap", {}, "GET");
      const sharedState = reconcileSharedState(result.sharedState ?? getDefaultSharedState());
      saveSharedCache(sharedState);

      return {
        mode: "apps-script",
        sharedState
      };
    },
    async mutate(type, payload, optimisticSharedState) {
      const result = await request(type, payload, "POST");
      const sharedState = reconcileSharedState(result.sharedState ?? optimisticSharedState);
      saveSharedCache(sharedState);
      return { sharedState };
    }
  };
}

function createEmailClient() {
  const publicKey = ENV.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = ENV.VITE_EMAILJS_SERVICE_ID;
  const templateId = ENV.VITE_EMAILJS_TEMPLATE_ID;

  emailjs.init({
    publicKey
  });

  return {
    mode: "emailjs",
    async bootstrap() {
      const sharedState = reconcileSharedState(loadSharedCache());
      saveSharedCache(sharedState);
      return {
        mode: "emailjs",
        sharedState
      };
    },
    async mutate(type, payload, optimisticSharedState) {
      const sharedState = reconcileSharedState(optimisticSharedState);
      saveSharedCache(sharedState);

      await emailjs.send(serviceId, templateId, {
        action: type,
        payload: JSON.stringify(payload, null, 2),
        page: window.location.href,
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString()
      });

      return { sharedState };
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

  if (mode === "apps-script" && ENV.VITE_APPS_SCRIPT_URL) {
    return createAppsScriptClient(ENV.VITE_APPS_SCRIPT_URL);
  }

  if (
    mode === "emailjs" &&
    ENV.VITE_EMAILJS_PUBLIC_KEY &&
    ENV.VITE_EMAILJS_SERVICE_ID &&
    ENV.VITE_EMAILJS_TEMPLATE_ID
  ) {
    return createEmailClient();
  }

  return createLocalClient();
}

export function applyOptimisticMutation(sharedState, type, payload) {
  return reconcileSharedState(applyMutation(sharedState, type, payload));
}
