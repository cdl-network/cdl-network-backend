// src/services/leadService.js
import { validateLead } from '../validation/leadSchema.js';
import { pushToHubSpot } from '../adapters/hubspotAdapter.js';
import {
  titleCase,
  buildDriverDetails,
  buildCarrierDetails,
} from '../utils/normalize.js';

// rawPayload = body from frontend
export async function createLead(rawPayload, meta = {}) {
  // 1) Validate fields with Joi
  const data = validateLead(rawPayload);

  const isDriver = data.lead_type === 'driver';

  // 2) Extract first/last name
  const fullName = isDriver ? data.full_name : data.contact_name;
  const [first, ...rest] = String(fullName).trim().split(/\s+/);
  const firstname = titleCase(first);
  const lastname = rest.length ? titleCase(rest.join(' ')) : '-';

  // 3) Common HubSpot properties
  const common = {
    firstname,
    lastname,
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    lead_type: data.lead_type,
  };

  // --------------------------------------------------
  // 4) DRIVER LEAD MAPPING (UPDATED for new quiz)
  // --------------------------------------------------
  let contactProps;

  if (isDriver) {
    contactProps = {
      ...common,

      scid: data.scid || undefined,


      // REQUIRED: matches HubSpot dropdown
      cdl_class: data.cdl_class, // has_cdl / training / no_cdl

      // OPTIONAL (legacy)
      state: data.state ? data.state.trim().toUpperCase() : undefined,

      // REQUIRED in new quiz (0–100)
      cdl_experience_level: data.years_exp,

      // OPTIONAL (legacy)
      availability: data.availability || undefined,
      preferred_region: data.preferred_region || undefined,

      // Truck types – from new quiz (comma-joined)
      truck_type_preference: data.truck_type_preference || undefined,

      // notes: CDL extra notes OR non-CDL job description
      additional_details: buildDriverDetails(data),
    };
  }

  // --------------------------------------------------
  // 5) CARRIER LEAD MAPPING (unchanged)
  // --------------------------------------------------
  else {
    contactProps = {
      ...common,
      scid: data.scid || undefined,
      company: titleCase(data.company_name),
      fleet_size: data.fleet_size,
      additional_details: buildCarrierDetails(data),
    };
  }

  // 6) HubSpot push
  try {
    const hubspotResult = await pushToHubSpot(contactProps);
    return hubspotResult;
  } catch (err) {
    if (!err.code) err.code = 'UPSTREAM';
    throw err;
  }
}
