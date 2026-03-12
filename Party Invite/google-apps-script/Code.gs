const SHEET_TABS = {
  groceryClaims: "grocery_claims",
  groceryAdditions: "grocery_additions",
  activityVotes: "activity_votes",
  activitySuggestions: "activity_suggestions",
  guestDetails: "guest_details",
  eventAudit: "event_audit"
};

function doGet(e) {
  const action = e.parameter.action || "bootstrap";

  if (action === "bootstrap") {
    return jsonResponse({
      ok: true,
      sharedState: buildSharedState()
    });
  }

  return jsonResponse({
    ok: false,
    error: "Unsupported GET action"
  });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const action = payload.action;

  ensureTabs();

  switch (action) {
    case "claimGrocery":
      writeGroceryClaim(payload);
      break;
    case "groceryContribution":
      writeGroceryContribution(payload);
      break;
    case "groceryEditRequest":
      writeGroceryEditRequest(payload);
      break;
    case "addGroceryItem":
      writeGroceryAddition(payload);
      break;
    case "voteActivity":
      writeActivityVote(payload);
      break;
    case "suggestActivity":
      writeActivitySuggestion(payload);
      break;
    case "saveGuestDetails":
      writeGuestDetails(payload);
      break;
    default:
      return jsonResponse({
        ok: false,
        error: "Unsupported POST action"
      });
  }

  writeAudit(action, payload.guestId || "system", JSON.stringify(payload));

  return jsonResponse({
    ok: true,
    sharedState: buildSharedState()
  });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateTab(name, headers) {
  const sheet = getSheet();
  let tab = sheet.getSheetByName(name);

  if (!tab) {
    tab = sheet.insertSheet(name);
    tab.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return tab;
}

function ensureTabs() {
  getOrCreateTab(SHEET_TABS.groceryClaims, ["itemId", "claimedBy", "updatedAt", "contributionHelpers", "editRequests"]);
  getOrCreateTab(SHEET_TABS.groceryAdditions, ["itemId", "section", "label", "note", "createdBy", "createdAt"]);
  getOrCreateTab(SHEET_TABS.activityVotes, ["activityId", "voterIds", "updatedAt"]);
  getOrCreateTab(SHEET_TABS.activitySuggestions, ["activityId", "title", "category", "note", "createdBy", "createdAt"]);
  getOrCreateTab(SHEET_TABS.guestDetails, ["guestId", "dietaryFlags", "dietaryNotes", "allergyNotes", "messageToKyle", "updatedAt"]);
  getOrCreateTab(SHEET_TABS.eventAudit, ["action", "guestId", "payload", "createdAt"]);
}

function upsertRow(sheetName, matchColumnIndex, matchValue, rowValues) {
  const tab = getOrCreateTab(sheetName, rowValues.map(function (_, index) {
    return "column_" + (index + 1);
  }));
  const values = tab.getDataRange().getValues();
  let targetRow = -1;

  for (let index = 1; index < values.length; index += 1) {
    if (values[index][matchColumnIndex - 1] === matchValue) {
      targetRow = index + 1;
      break;
    }
  }

  if (targetRow === -1) {
    tab.appendRow(rowValues);
  } else {
    tab.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
}

function writeGroceryClaim(payload) {
  const tab = getOrCreateTab(SHEET_TABS.groceryClaims, ["itemId", "claimedBy", "updatedAt", "contributionHelpers", "editRequests"]);
  const values = tab.getDataRange().getValues();
  let helperIds = [];
  let editRequests = [];

  for (let index = 1; index < values.length; index += 1) {
    if (values[index][0] === payload.itemId) {
      helperIds = safeJson(values[index][3], []);
      editRequests = safeJson(values[index][4], []);
    }
  }

  upsertRow(SHEET_TABS.groceryClaims, 1, payload.itemId, [
    payload.itemId,
    payload.action === "claim" ? payload.guestId : "",
    new Date().toISOString(),
    JSON.stringify(helperIds),
    JSON.stringify(editRequests)
  ]);
}

function writeGroceryContribution(payload) {
  const tab = getOrCreateTab(SHEET_TABS.groceryClaims, ["itemId", "claimedBy", "updatedAt", "contributionHelpers", "editRequests"]);
  const values = tab.getDataRange().getValues();
  let claimedBy = "";
  let helperIds = [];
  let editRequests = [];

  for (let index = 1; index < values.length; index += 1) {
    if (values[index][0] === payload.itemId) {
      claimedBy = values[index][1];
      helperIds = safeJson(values[index][3], []);
      editRequests = safeJson(values[index][4], []);
    }
  }

  helperIds = helperIds.filter(function (guestId) {
    return guestId !== payload.guestId;
  });

  if (payload.helpingPay) {
    helperIds.push(payload.guestId);
  }

  upsertRow(SHEET_TABS.groceryClaims, 1, payload.itemId, [
    payload.itemId,
    claimedBy,
    new Date().toISOString(),
    JSON.stringify(helperIds),
    JSON.stringify(editRequests)
  ]);
}

function writeGroceryEditRequest(payload) {
  const tab = getOrCreateTab(SHEET_TABS.groceryClaims, ["itemId", "claimedBy", "updatedAt", "contributionHelpers", "editRequests"]);
  const values = tab.getDataRange().getValues();
  let claimedBy = "";
  let helperIds = [];
  let editRequests = [];

  for (let index = 1; index < values.length; index += 1) {
    if (values[index][0] === payload.itemId) {
      claimedBy = values[index][1];
      helperIds = safeJson(values[index][3], []);
      editRequests = safeJson(values[index][4], []);
    }
  }

  editRequests.push({
    guestId: payload.guestId,
    note: payload.note,
    createdAt: new Date().toISOString()
  });

  upsertRow(SHEET_TABS.groceryClaims, 1, payload.itemId, [
    payload.itemId,
    claimedBy,
    new Date().toISOString(),
    JSON.stringify(helperIds),
    JSON.stringify(editRequests)
  ]);
}

function writeGroceryAddition(payload) {
  const itemId = "guest-" + new Date().getTime();
  getOrCreateTab(SHEET_TABS.groceryAdditions, ["itemId", "section", "label", "note", "createdBy", "createdAt"]).appendRow([
    itemId,
    payload.section,
    payload.label,
    payload.note || "",
    payload.guestId,
    new Date().toISOString()
  ]);
}

function writeActivityVote(payload) {
  const tab = getOrCreateTab(SHEET_TABS.activityVotes, ["activityId", "voterIds", "updatedAt"]);
  const values = tab.getDataRange().getValues();
  let voterIds = [];

  for (let index = 1; index < values.length; index += 1) {
    if (values[index][0] === payload.activityId) {
      voterIds = safeJson(values[index][1], []);
    }
  }

  if (voterIds.indexOf(payload.guestId) === -1) {
    voterIds.push(payload.guestId);
  }

  upsertRow(SHEET_TABS.activityVotes, 1, payload.activityId, [
    payload.activityId,
    JSON.stringify(voterIds),
    new Date().toISOString()
  ]);
}

function writeActivitySuggestion(payload) {
  getOrCreateTab(SHEET_TABS.activitySuggestions, ["activityId", "title", "category", "note", "createdBy", "createdAt"]).appendRow([
    "suggested-" + new Date().getTime(),
    payload.title,
    payload.category,
    payload.note || "",
    payload.guestId,
    new Date().toISOString()
  ]);
}

function writeGuestDetails(payload) {
  upsertRow(SHEET_TABS.guestDetails, 1, payload.guestId, [
    payload.guestId,
    JSON.stringify(payload.dietaryFlags || []),
    payload.dietaryNotes || "",
    payload.allergyNotes || "",
    payload.messageToKyle || "",
    new Date().toISOString()
  ]);
}

function writeAudit(action, guestId, payload) {
  getOrCreateTab(SHEET_TABS.eventAudit, ["action", "guestId", "payload", "createdAt"]).appendRow([
    action,
    guestId,
    payload,
    new Date().toISOString()
  ]);
}

function buildSharedState() {
  ensureTabs();

  return {
    groceries: buildGroceriesState(),
    activities: buildActivitiesState(),
    guestDetails: buildGuestDetailsState()
  };
}

function buildGroceriesState() {
  const rows = getOrCreateTab(SHEET_TABS.groceryClaims, ["itemId", "claimedBy", "updatedAt", "contributionHelpers", "editRequests"])
    .getDataRange()
    .getValues()
    .slice(1);

  const claims = {};
  const payHelpers = {};
  const editRequests = {};

  rows.forEach(function (row) {
    if (row[0]) {
      if (row[1]) {
        claims[row[0]] = row[1];
      }
      payHelpers[row[0]] = safeJson(row[3], []);
      editRequests[row[0]] = safeJson(row[4], []);
    }
  });

  const additions = getOrCreateTab(SHEET_TABS.groceryAdditions, ["itemId", "section", "label", "note", "createdBy", "createdAt"])
    .getDataRange()
    .getValues()
    .slice(1)
    .map(function (row) {
      return {
        itemId: row[0],
        section: row[1],
        label: row[2],
        note: row[3],
        createdBy: row[4],
        createdAt: row[5],
        guestAdded: true,
        defaultSource: "Guest suggestion",
        budgetNote: ""
      };
    });

  return {
    claims: claims,
    payHelpers: payHelpers,
    editRequests: editRequests,
    additions: additions
  };
}

function buildActivitiesState() {
  const voteRows = getOrCreateTab(SHEET_TABS.activityVotes, ["activityId", "voterIds", "updatedAt"])
    .getDataRange()
    .getValues()
    .slice(1);
  const suggestionRows = getOrCreateTab(SHEET_TABS.activitySuggestions, ["activityId", "title", "category", "note", "createdBy", "createdAt"])
    .getDataRange()
    .getValues()
    .slice(1);
  const votes = {};

  voteRows.forEach(function (row) {
    if (row[0]) {
      votes[row[0]] = safeJson(row[1], []);
    }
  });

  return {
    votes: votes,
    suggestions: suggestionRows.map(function (row) {
      return {
        activityId: row[0],
        title: row[1],
        category: row[2],
        note: row[3],
        createdBy: row[4],
        createdAt: row[5],
        subtype: "Guest suggestion",
        location: "TBD",
        driveTime: "TBD",
        cost: "TBD",
        energy: "Unknown",
        description: row[3] || "Guest suggestion",
        voteable: true,
        featured: false
      };
    })
  };
}

function buildGuestDetailsState() {
  const rows = getOrCreateTab(SHEET_TABS.guestDetails, ["guestId", "dietaryFlags", "dietaryNotes", "allergyNotes", "messageToKyle", "updatedAt"])
    .getDataRange()
    .getValues()
    .slice(1);
  const details = {};

  rows.forEach(function (row) {
    if (row[0]) {
      details[row[0]] = {
        dietaryFlags: safeJson(row[1], []),
        dietaryNotes: row[2],
        allergyNotes: row[3],
        messageToKyle: row[4],
        updatedAt: row[5]
      };
    }
  });

  return details;
}

function safeJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}
