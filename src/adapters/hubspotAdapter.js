// src/adapters/hubspotAdapter.js
import { HUBSPOT_TOKEN } from '../config.js';
import { cleanObject } from '../utils/normalize.js';

const HUBSPOT_CONTACTS_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

export async function pushToHubSpot(p) {
  const properties = cleanObject({
    firstname: p.firstname,
    lastname: p.lastname || '-',
    phone: p.phone,
    email: p.email,
    company: p.company,

    state: p.state,

    lead_type: p.lead_type,          // custom property in HubSpot
    cdl_class: p.cdl_class,          // custom
    cdl_experience_level: p.years_exp,          // custom 
    availability: p.availability,    // custom dropdown

    fleet_size: p.fleet_size,        // custom dropdown (carriers)
    additional_details: p.additional_details, // custom multi-line text
  });

  const payload = { properties };

  const res = await fetch(HUBSPOT_CONTACTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    const err = new Error('HubSpot failed');
    err.code = 'UPSTREAM';
    err.details = text;
    throw err;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}