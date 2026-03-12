import { eventContent } from "../data/content.js";
import { flightStatusKey } from "../lib/flightStatus.js";

function formatCacheAge(cachedAt) {
  const ageMs = Date.now() - cachedAt;
  const mins = Math.floor(ageMs / 60000);
  if (mins < 1) return "Updated just now";
  if (mins === 1) return "Updated 1 min ago";
  return `Updated ${mins} min ago`;
}

function isWithin26Hours(rawDateStr) {
  const d = new Date(rawDateStr);
  if (isNaN(d)) return false;
  return (d - Date.now()) / (1000 * 60 * 60) <= 26;
}

function renderFlightStatusBadge(statusData, flightDate) {
  if (statusData === undefined) {
    // Only show "Checking status…" when the flight is actually close enough to have live data.
    // Suppresses the confusing flash when the API immediately returns TooEarly.
    return isWithin26Hours(flightDate)
      ? `<span class="status-badge status-loading">Checking status…</span>`
      : "";
  }
  if (!statusData || statusData.status === "TooEarly") {
    return "";
  }

  const { status, delayMinutes } = statusData;

  if (status === "Landed") {
    return `<span class="status-badge status-ok">Landed ✓</span>`;
  }
  if (status === "Cancelled") {
    return `<span class="status-badge status-err">Cancelled</span>`;
  }
  if (status === "Delayed") {
    const suffix = delayMinutes ? ` ${delayMinutes} min` : "";
    return `<span class="status-badge status-warn">Delayed${suffix}</span>`;
  }
  if (status === "EnRoute") {
    const suffix = delayMinutes > 0 ? ` · ${delayMinutes} min delay` : "";
    return `<span class="status-badge ${delayMinutes > 0 ? "status-warn" : "status-ok"}">In flight${suffix}</span>`;
  }
  if (status === "Scheduled") {
    return `<span class="status-badge status-ok">On time</span>`;
  }

  return `<span class="status-badge status-loading">${status}</span>`;
}

function renderFlightCard(label, flight, statusData) {
  if (!flight) {
    return "";
  }

  const badge = renderFlightStatusBadge(statusData, flight.date);
  const cacheAge = statusData?._cachedAt ? formatCacheAge(statusData._cachedAt) : null;

  const scheduledDep = statusData?.scheduledDeparture ?? flight.departureTime;
  const actualDep = statusData?.actualDeparture;
  const hasDeptRevision = actualDep && actualDep !== scheduledDep;
  const deptTimeDisplay = hasDeptRevision
    ? `<span class="time-revised">${scheduledDep}</span> → ${actualDep}`
    : scheduledDep;

  const scheduledArr = statusData?.scheduledArrival ?? flight.arrivalTime ?? "";
  const actualArr = statusData?.actualArrival;
  const hasArrRevision = actualArr && actualArr !== scheduledArr;
  const arrTimeDisplay = hasArrRevision
    ? `<span class="time-revised">${scheduledArr}</span> → ${actualArr}`
    : scheduledArr;

  const departureGate = statusData?.departureGate
    ? `<p class="muted">Gate ${statusData.departureGate}</p>`
    : "";
  const arrivalGate = statusData?.arrivalGate
    ? `<p class="muted">Arrival gate ${statusData.arrivalGate}</p>`
    : "";

  return `
    <article class="card">
      <p class="section-kicker">${label}</p>
      <h3>${flight.airline} ${flight.flightNumber}</h3>
      ${badge}
      ${cacheAge ? `<p class="status-updated">${cacheAge}</p>` : ""}
      <div class="key-value-grid">
        <div>
          <span class="label">Date</span>
          <strong>${flight.date}</strong>
        </div>
        <div>
          <span class="label">Departure</span>
          <strong>${flight.departureAirport} at ${deptTimeDisplay}</strong>
          <p>${flight.departureLabel}</p>
          ${departureGate}
        </div>
        <div>
          <span class="label">Arrival</span>
          <strong>${flight.arrivalAirport ?? ""}${arrTimeDisplay ? ` at ${arrTimeDisplay}` : ""}</strong>
          <p>${flight.arrivalLabel}</p>
          ${arrivalGate}
        </div>
        ${flight.layover ? `<div><span class="label">Layover</span><strong>${flight.layover}</strong></div>` : ""}
      </div>
    </article>
  `;
}

export function renderMyInfoView({ guest, state }) {
  const hasFlight = guest.travelType === "flight" && guest.flight;
  const hasPickup = Boolean(guest.pickup);
  const flightStatuses = state.flightStatuses ?? {};

  const inbound = hasFlight ? guest.flight.inbound : null;
  const outbound = hasFlight ? guest.flight.outbound : null;

  const inboundStatus = inbound
    ? flightStatuses[flightStatusKey(inbound.flightNumberIata ?? inbound.flightNumber, inbound.date)]
    : undefined;

  const outboundStatus = outbound
    ? flightStatuses[flightStatusKey(outbound.flightNumberIata ?? outbound.flightNumber, outbound.date)]
    : undefined;

  return `
    <section class="tab-section">
      <header class="section-header page-header">
        <div>
          <p class="section-kicker">Travel and arrival</p>
          <h2>${guest.displayName}, here is your route plan</h2>
          <p class="section-copy">Key logistics first, with the same tighter dashboard system used across the board.</p>
        </div>
        <div class="section-actions page-header-side">
          <a class="button button-secondary" href="${eventContent.address.mapsUrl}" target="_blank" rel="noreferrer">
            Directions
          </a>
          <button class="button button-secondary" data-action="copy-address">
            ${eventContent.copyAddressLabel}
          </button>
        </div>
      </header>

      <div class="dashboard-grid">
        <article class="card accent-card">
          <p class="section-kicker">Base camp</p>
          <h3>${eventContent.hostName}'s house</h3>
          <p>${eventContent.address.full}</p>
          <p class="muted">Official start: ${eventContent.officialStart}. Early arrivals are welcome from ${eventContent.earlyArrival}.</p>
          <p class="muted">Phone: <a href="tel:${eventContent.hostPhone}">${eventContent.hostPhone}</a></p>
        </article>

        ${
          hasPickup
            ? `
              <article class="card">
                <p class="section-kicker">Pickup</p>
                <h3>${guest.pickup.time}</h3>
                <p>${guest.pickup.location}</p>
                <p class="muted">${guest.pickup.date} with ${guest.pickup.driver}</p>
              </article>
            `
            : `
              <article class="card">
                <p class="section-kicker">Arrival</p>
                <h3>${guest.travelType === "driving" ? "Drive in when ready" : "On-site already"}</h3>
                <ul class="compact-list">
                  ${guest.arrivalOptions.map((option) => `<li>${option}</li>`).join("")}
                </ul>
              </article>
            `
        }

        ${
          guest.foodRole
            ? `
              <article class="card">
                <p class="section-kicker">Food role</p>
                <h3>${guest.foodRole}</h3>
                <p class="muted">${guest.notes}</p>
              </article>
            `
            : ""
        }

        ${
          guest.travelType === "driving"
            ? `
              <article class="card">
                <p class="section-kicker">Morning logistics</p>
                <h3>Flexible arrival works</h3>
                <ul class="compact-list">
                  ${guest.arrivalOptions.map((option) => `<li>${option}</li>`).join("")}
                </ul>
              </article>
            `
            : ""
        }
      </div>

      ${hasFlight ? renderFlightCard("Inbound flight", guest.flight.inbound, inboundStatus) : ""}
      ${hasFlight ? renderFlightCard("Return flight", guest.flight.outbound, outboundStatus) : ""}
    </section>
  `;
}
