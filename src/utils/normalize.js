export function sentenceCase(str) {
  if (!str) return '';
  const s = String(str).trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function titleCase(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([ , v ]) => {
      if (v === undefined || v === null) return false;
      if (typeof v === 'string' && v.trim() === '') return false;
      return true;
    })
  );
}

export function buildDriverDetails(data) {
  const parts = [];

  // CDL status (new quiz)
  if (data.cdl_class) {
    const cdlText =
      data.cdl_class === 'has_cdl'
        ? 'Has CDL-A'
        : data.cdl_class === 'training'
        ? 'Still in CDL training'
        : 'Looking for non-CDL position';

    parts.push(`CDL status: ${cdlText}`);
  }

  // Truck types (new quiz – comma joined string)
  if (data.truck_type_preference) {
    parts.push(`Truck types: ${data.truck_type_preference}`);
  }

  // Legacy but harmless if empty
  if (data.preferred_region) {
    parts.push(`Preferred region: ${sentenceCase(data.preferred_region)}`);
  }

  // Notes (includes non-CDL position description)
  if (data.notes) {
    parts.push(`Notes: ${String(data.notes).trim()}`);
  }

  return parts.join('\n');
}


export function buildCarrierDetails(data) {
  const parts = [];

  if (data.lane_type) {
    parts.push(`Lane type: ${sentenceCase(data.lane_type)}`);
  }

  if (data.hiring_needs) {
    parts.push(`Hiring needs: ${String(data.hiring_needs).trim()}`);
  }

  return parts.join('\n');
}
