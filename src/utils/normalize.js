// src/utils/normalize.js

// Simple sentence case: first letter upper, rest lower.
// Only use this for SHORT descriptor fields (region, lane type, etc.)
export function sentenceCase(str) {
  if (!str) return '';
  const s = String(str).trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Title case for names / company names.
export function titleCase(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Strip undefined / null / empty string keys.
export function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );
}

// Build additional_details for DRIVER leads.
// Short fields go through sentenceCase, long free text is kept raw (trimmed)
// so we don't destroy acronyms like SAP / OTR, etc.
export function buildDriverDetails(data) {
  const parts = [];

  if (data.preferred_region) {
    parts.push(`Preferred region: ${sentenceCase(data.preferred_region)}`);
  }

  if (data.truck_type_preference) {
    parts.push(
      `Truck type preference: ${sentenceCase(data.truck_type_preference)}`
    );
  }

  if (data.notes) {
    // keep original wording, just trim
    parts.push(`Notes: ${String(data.notes).trim()}`);
  }

  return parts.join('\n');
}

// Build additional_details for CARRIER leads.
export function buildCarrierDetails(data) {
  const parts = [];

  if (data.lane_type) {
    parts.push(`Lane type: ${sentenceCase(data.lane_type)}`);
  }

  if (data.hiring_needs) {
    // keep original wording, just trim
    parts.push(`Hiring needs: ${String(data.hiring_needs).trim()}`);
  }

  return parts.join('\n');
}
