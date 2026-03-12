// AeroDataBox via RapidAPI — 15 free lookups/day
// API key is intentionally client-side: this is a private invite app with 6 known users.
// Get your key at: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
const RAPIDAPI_KEY = "YOUR_KEY_HERE";

const CACHE_PREFIX = "ttrpg-flight-v1-";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function normalizeFlightNumber(raw) {
  // "G4 1715" → "G41715", "3163 -> 3162" → take first segment
  const first = raw.split(/\s*[-–>]+\s*/)[0].trim();
  return first.replace(/\s+/g, "");
}

function parseDateToIso(dateStr) {
  // "March 21, 2026" → "2026-03-21"
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10);
}

function formatLocalTime(isoStr) {
  if (!isoStr) return null;
  // API returns "2026-03-21 08:12" local or ISO
  const d = new Date(isoStr);
  if (isNaN(d)) return isoStr;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function cacheKey(flightNum, dateIso) {
  return `${CACHE_PREFIX}${flightNum}-${dateIso}`;
}

function readCache(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return { data, timestamp };
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // storage full — silently skip caching
  }
}

function parseResponse(raw) {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return null;
  const f = raw[0];

  const dep = f.departure ?? {};
  const arr = f.arrival ?? {};

  const scheduledDep = dep.scheduledTime?.local ?? null;
  const actualDep = dep.actualTime?.local ?? dep.revisedTime?.local ?? null;
  const scheduledArr = arr.scheduledTime?.local ?? null;
  const actualArr = arr.actualTime?.local ?? arr.revisedTime?.local ?? null;
  const delayMinutes = dep.delay ?? arr.delay ?? null;

  return {
    status: f.status ?? "Unknown",
    scheduledDeparture: formatLocalTime(scheduledDep),
    actualDeparture: formatLocalTime(actualDep),
    scheduledArrival: formatLocalTime(scheduledArr),
    actualArrival: formatLocalTime(actualArr),
    delayMinutes: typeof delayMinutes === "number" ? Math.round(delayMinutes) : null,
    departureGate: dep.gate ?? null,
    arrivalGate: arr.gate ?? null
  };
}

export async function fetchFlightStatus(rawFlightNumber, rawDateStr) {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "YOUR_KEY_HERE") {
    return null; // no key configured — degrade silently
  }

  const flightNum = normalizeFlightNumber(rawFlightNumber);
  const dateIso = parseDateToIso(rawDateStr);
  if (!flightNum || !dateIso) return null;

  // Don't bother fetching more than 24 hours before the flight date
  const flightDate = new Date(dateIso + "T00:00:00");
  const hoursUntilFlight = (flightDate - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilFlight > 26) {
    return { status: "TooEarly", scheduledDeparture: null, actualDeparture: null, scheduledArrival: null, actualArrival: null, delayMinutes: null, departureGate: null, arrivalGate: null };
  }

  const key = cacheKey(flightNum, dateIso);
  const cached = readCache(key);
  if (cached) {
    return { ...cached.data, _cachedAt: cached.timestamp };
  }

  try {
    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(flightNum)}/${dateIso}?withAircraftImage=false&withLocation=false`;
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
      }
    });

    if (!response.ok) {
      return null; // quota exceeded, auth error, or not found — degrade silently
    }

    const json = await response.json();
    const parsed = parseResponse(json);
    if (parsed) {
      writeCache(key, parsed);
      return { ...parsed, _cachedAt: Date.now() };
    }
    return null;
  } catch {
    return null; // network error — degrade silently
  }
}

export function flightStatusKey(rawFlightNumber, rawDateStr) {
  const flightNum = normalizeFlightNumber(rawFlightNumber);
  const dateIso = parseDateToIso(rawDateStr);
  return `${flightNum}:${dateIso}`;
}
