// src/services/leadService.js
import { validateLead } from '../validation/leadSchema.js';
import { pushToHubSpot } from '../adapters/hubspotAdapter.js';
import {
  titleCase,
  buildDriverDetails,
  buildCarrierDetails,
} from '../utils/normalize.js';

// rawPayload = body from frontend
// meta = { ip } etc. (currently unused but kept for future)
export async function createLead(rawPayload, meta = {}) {
  // 1) Validate and normalize fields with Joi
  const data = validateLead(rawPayload);

  const isDriver = data.lead_type === 'driver';

  // 2) Build first/last name from full_name / contact_name
  const fullName = isDriver ? data.full_name : data.contact_name;
  const [first, ...rest] = String(fullName).trim().split(/\s+/);
  const firstname = titleCase(first);
  const lastname = rest.length ? titleCase(rest.join(' ')) : '-';

  // 3) Common props for both contact types
  const common = {
    firstname,
    lastname,
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    lead_type: data.lead_type, // HubSpot custom property "lead_type"
  };

  // 4) Build contact-specific properties
  let contactProps;

  if (isDriver) {
    // DRIVER lead
    contactProps = {
      ...common,
      state: data.state.trim().toUpperCase(), // e.g. IL, TX
      cdl_class: data.cdl_class,              // yes / no
      years_exp: data.years_exp,             // number
      availability: data.availability || undefined, // immediate / 2_weeks / 1_month
      additional_details: buildDriverDetails(data),
    };
  } else {
    // CARRIER lead
    contactProps = {
      ...common,
      company: titleCase(data.company_name),
      fleet_size: data.fleet_size,               // 1_10_trucks etc.
      additional_details: buildCarrierDetails(data),
    };
  }

  // 5) Push to HubSpot
  try {
    const hubspotResult = await pushToHubSpot(contactProps);
    // hubspotResult should contain .id (contact ID)
    return hubspotResult;
  } catch (err) {
    if (!err.code) err.code = 'UPSTREAM';
    throw err;
  }
}
