const SHEET_TABS = {
  groceryClaims: "grocery_claims",
  groceryAdditions: "grocery_additions",
  activityVotes: "activity_votes",
  activitySuggestions: "activity_suggestions",
  guestDetails: "guest_details",
  eventAudit: "event_audit"
};

const TAB_HEADERS = {
  groceryClaims: ["itemId", "claimedBy", "updatedAt", "contributionHelpers", "editRequests"],
  groceryAdditions: ["itemId", "section", "label", "note", "createdBy", "createdAt"],
  activityVotes: ["activityId", "voterIds", "updatedAt"],
  activitySuggestions: ["activityId", "title", "category", "note", "createdBy", "createdAt"],
  guestDetails: ["guestId", "dietaryFlags", "dietaryNotes", "allergyNotes", "messageToKyle", "updatedAt"],
  eventAudit: ["mutationId", "action", "guestId", "guestName", "payload", "emailStatus", "createdAt", "updatedAt"]
};

const DEFAULT_NOTIFICATION_EMAIL = "composer01@gmail.com";
const EMAIL_STATUS_PENDING = "pending";
const EMAIL_STATUS_SENT = "sent";

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
  const payload = parsePayload(e);
  const action = payload.action;

  ensureTabs();

  if (!action) {
    return jsonResponse({
      ok: false,
      error: "Missing POST action"
    });
  }

  payload.mutationId = payload.mutationId || "server-" + new Date().getTime();
  payload.submittedAt = payload.submittedAt || new Date().toISOString();
  payload.guestName = payload.guestName || "Guest";

  const existingAudit = getAuditRecord(payload.mutationId);
  if (existingAudit) {
    const emailStatus = retryNotificationIfNeeded(action, payload, existingAudit);

    return jsonResponse({
      ok: true,
      alreadyProcessed: true,
      emailStatus: emailStatus,
      sharedState: buildSharedState()
    });
  }

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

  writeAudit(action, payload, EMAIL_STATUS_PENDING);
  const emailStatus = sendNotificationSafely(action, payload);
  updateAuditEmailStatus(payload.mutationId, emailStatus);

  return jsonResponse({
    ok: true,
    emailStatus: emailStatus,
    sharedState: buildSharedState()
  });
}

function parsePayload(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";

  try {
    return JSON.parse(raw);
  } catch (error) {
    return e && e.parameter ? e.parameter : {};
  }
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
  }

  ensureTabHeaders(tab, headers);
  return tab;
}

function ensureTabHeaders(tab, headers) {
  if (!tab.getLastRow()) {
    tab.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const currentHeaders = tab.getRange(1, 1, 1, Math.max(tab.getLastColumn(), headers.length)).getValues()[0];
  const needsUpdate = headers.some(function (header, index) {
    return currentHeaders[index] !== header;
  });

  if (needsUpdate || tab.getLastColumn() < headers.length) {
    tab.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function ensureTabs() {
  getOrCreateTab(SHEET_TABS.groceryClaims, TAB_HEADERS.groceryClaims);
  getOrCreateTab(SHEET_TABS.groceryAdditions, TAB_HEADERS.groceryAdditions);
  getOrCreateTab(SHEET_TABS.activityVotes, TAB_HEADERS.activityVotes);
  getOrCreateTab(SHEET_TABS.activitySuggestions, TAB_HEADERS.activitySuggestions);
  getOrCreateTab(SHEET_TABS.guestDetails, TAB_HEADERS.guestDetails);
  getOrCreateTab(SHEET_TABS.eventAudit, TAB_HEADERS.eventAudit);
}

function upsertRow(sheetName, matchColumnIndex, matchValue, rowValues, headers) {
  const tab = getOrCreateTab(sheetName, headers || rowValues.map(function (_, index) {
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

function getAuditRecord(mutationId) {
  if (!mutationId) {
    return null;
  }

  const rows = getOrCreateTab(SHEET_TABS.eventAudit, TAB_HEADERS.eventAudit).getDataRange().getValues();

  for (let index = 1; index < rows.length; index += 1) {
    if (rows[index][0] === mutationId) {
      return {
        rowIndex: index + 1,
        mutationId: rows[index][0],
        action: rows[index][1],
        guestId: rows[index][2],
        guestName: rows[index][3],
        payload: rows[index][4],
        emailStatus: rows[index][5],
        createdAt: rows[index][6],
        updatedAt: rows[index][7]
      };
    }
  }

  return null;
}

function writeAudit(action, payload, emailStatus) {
  upsertRow(
    SHEET_TABS.eventAudit,
    1,
    payload.mutationId,
    [
      payload.mutationId,
      action,
      payload.guestId || "system",
      payload.guestName || "",
      JSON.stringify(payload),
      emailStatus,
      payload.submittedAt || new Date().toISOString(),
      new Date().toISOString()
    ],
    TAB_HEADERS.eventAudit
  );
}

function updateAuditEmailStatus(mutationId, emailStatus) {
  const audit = getAuditRecord(mutationId);
  if (!audit) {
    return;
  }

  getOrCreateTab(SHEET_TABS.eventAudit, TAB_HEADERS.eventAudit)
    .getRange(audit.rowIndex, 6, 1, 2)
    .setValues([[emailStatus, new Date().toISOString()]]);
}

function retryNotificationIfNeeded(action, payload, audit) {
  if (!audit || audit.emailStatus === EMAIL_STATUS_SENT) {
    return audit ? audit.emailStatus : EMAIL_STATUS_SENT;
  }

  const emailStatus = sendNotificationSafely(action, payload);
  updateAuditEmailStatus(payload.mutationId, emailStatus);
  return emailStatus;
}

function sendNotificationSafely(action, payload) {
  try {
    sendNotificationEmail(action, payload);
    return EMAIL_STATUS_SENT;
  } catch (error) {
    return "failed: " + error.message;
  }
}

function getNotificationEmail() {
  const configured = PropertiesService.getScriptProperties().getProperty("NOTIFICATION_EMAIL");
  return configured || DEFAULT_NOTIFICATION_EMAIL;
}

function sendNotificationEmail(action, payload) {
  const recipient = getNotificationEmail();
  const subject = "Party Invite: " + action + " from " + (payload.guestName || "Guest");
  const body = buildNotificationBody(action, payload);

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: body,
    name: "Party Invite"
  });
}

function buildNotificationBody(action, payload) {
  const details = getActionDetails(action, payload);
  const lines = [
    "Party Invite update received.",
    "",
    "Action: " + action,
    "Guest: " + (payload.guestName || "Guest"),
    "Guest ID: " + (payload.guestId || "unknown"),
    "Submitted at: " + (payload.submittedAt || new Date().toISOString()),
    "Page: " + (payload.pageUrl || ""),
    "Source: " + (payload.source || "party-invite")
  ];

  if (details.length) {
    lines.push("");
    lines.push("Details:");
    details.forEach(function (detail) {
      lines.push("- " + detail);
    });
  }

  lines.push("");
  lines.push("Raw payload:");
  lines.push(JSON.stringify(payload, null, 2));

  return lines.join("\n");
}

function getActionDetails(action, payload) {
  switch (action) {
    case "claimGrocery":
      return [
        "Item ID: " + payload.itemId,
        "Action: " + (payload.action === "unclaim" ? "Released claim" : "Claimed item")
      ];
    case "groceryContribution":
      return [
        "Item ID: " + payload.itemId,
        payload.helpingPay ? "Marked as helping pay." : "Removed themselves from helping pay."
      ];
    case "groceryEditRequest":
      return [
        "Item ID: " + payload.itemId,
        "Note: " + (payload.note || "")
      ];
    case "addGroceryItem":
      return [
        "Section: " + (payload.section || ""),
        "Label: " + (payload.label || ""),
        "Note: " + (payload.note || "")
      ];
    case "voteActivity":
      return [
        "Activity ID: " + payload.activityId
      ];
    case "suggestActivity":
      return [
        "Title: " + (payload.title || ""),
        "Category: " + (payload.category || ""),
        "Note: " + (payload.note || "")
      ];
    case "saveGuestDetails":
      return [
        "Dietary flags: " + JSON.stringify(payload.dietaryFlags || []),
        "Dietary notes: " + (payload.dietaryNotes || ""),
        "Allergy notes: " + (payload.allergyNotes || ""),
        "Message to Kyle: " + (payload.messageToKyle || "")
      ];
    default:
      return [];
  }
}

function writeGroceryClaim(payload) {
  const tab = getOrCreateTab(SHEET_TABS.groceryClaims, TAB_HEADERS.groceryClaims);
  const values = tab.getDataRange().getValues();
  let helperIds = [];
  let editRequests = [];

  for (let index = 1; index < values.length; index += 1) {
    if (values[index][0] === payload.itemId) {
      helperIds = safeJson(values[index][3], []);
      editRequests = safeJson(values[index][4], []);
    }
  }

  upsertRow(
    SHEET_TABS.groceryClaims,
    1,
    payload.itemId,
    [
      payload.itemId,
      payload.action === "claim" ? payload.guestId : "",
      payload.submittedAt || new Date().toISOString(),
      JSON.stringify(helperIds),
      JSON.stringify(editRequests)
    ],
    TAB_HEADERS.groceryClaims
  );
}

function writeGroceryContribution(payload) {
  const tab = getOrCreateTab(SHEET_TABS.groceryClaims, TAB_HEADERS.groceryClaims);
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

  upsertRow(
    SHEET_TABS.groceryClaims,
    1,
    payload.itemId,
    [
      payload.itemId,
      claimedBy,
      payload.submittedAt || new Date().toISOString(),
      JSON.stringify(helperIds),
      JSON.stringify(editRequests)
    ],
    TAB_HEADERS.groceryClaims
  );
}

function writeGroceryEditRequest(payload) {
  const tab = getOrCreateTab(SHEET_TABS.groceryClaims, TAB_HEADERS.groceryClaims);
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
    createdAt: payload.submittedAt || new Date().toISOString()
  });

  upsertRow(
    SHEET_TABS.groceryClaims,
    1,
    payload.itemId,
    [
      payload.itemId,
      claimedBy,
      payload.submittedAt || new Date().toISOString(),
      JSON.stringify(helperIds),
      JSON.stringify(editRequests)
    ],
    TAB_HEADERS.groceryClaims
  );
}

function writeGroceryAddition(payload) {
  const createdAt = payload.submittedAt || new Date().toISOString();
  getOrCreateTab(SHEET_TABS.groceryAdditions, TAB_HEADERS.groceryAdditions).appendRow([
    "guest-" + new Date().getTime(),
    payload.section,
    payload.label,
    payload.note || "",
    payload.guestId,
    createdAt
  ]);
}

function writeActivityVote(payload) {
  const tab = getOrCreateTab(SHEET_TABS.activityVotes, TAB_HEADERS.activityVotes);
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

  upsertRow(
    SHEET_TABS.activityVotes,
    1,
    payload.activityId,
    [
      payload.activityId,
      JSON.stringify(voterIds),
      payload.submittedAt || new Date().toISOString()
    ],
    TAB_HEADERS.activityVotes
  );
}

function writeActivitySuggestion(payload) {
  const createdAt = payload.submittedAt || new Date().toISOString();
  getOrCreateTab(SHEET_TABS.activitySuggestions, TAB_HEADERS.activitySuggestions).appendRow([
    "suggested-" + new Date().getTime(),
    payload.title,
    payload.category,
    payload.note || "",
    payload.guestId,
    createdAt
  ]);
}

function writeGuestDetails(payload) {
  upsertRow(
    SHEET_TABS.guestDetails,
    1,
    payload.guestId,
    [
      payload.guestId,
      JSON.stringify(payload.dietaryFlags || []),
      payload.dietaryNotes || "",
      payload.allergyNotes || "",
      payload.messageToKyle || "",
      payload.submittedAt || new Date().toISOString()
    ],
    TAB_HEADERS.guestDetails
  );
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
  const rows = getOrCreateTab(SHEET_TABS.groceryClaims, TAB_HEADERS.groceryClaims)
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

  const additions = getOrCreateTab(SHEET_TABS.groceryAdditions, TAB_HEADERS.groceryAdditions)
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
  const voteRows = getOrCreateTab(SHEET_TABS.activityVotes, TAB_HEADERS.activityVotes)
    .getDataRange()
    .getValues()
    .slice(1);
  const suggestionRows = getOrCreateTab(SHEET_TABS.activitySuggestions, TAB_HEADERS.activitySuggestions)
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
  const rows = getOrCreateTab(SHEET_TABS.guestDetails, TAB_HEADERS.guestDetails)
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
