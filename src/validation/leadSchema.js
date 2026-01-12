// src/validation/leadSchema.js
import Joi from 'joi';

const baseString = Joi.string().trim();

// ------------------------------------------------------
// DRIVER LEAD SCHEMA
// New quiz uses: cdl_class, years_exp, truck_type_preference, notes, contact info.
// Legacy fields (state, availability, preferred_region) remain OPTIONAL.
// ------------------------------------------------------
const driverSchema = Joi.object({
  lead_type: Joi.string().valid('driver').required(),

  full_name: baseString.min(2).max(200).required(),
  phone: baseString.min(5).max(50).required(),
  email: baseString.email().max(200).required(),

  // NEW + REQUIRED
  // Matches HubSpot: has_cdl, training, no_cdl
  cdl_class: Joi.string()
    .valid('has_cdl', 'training', 'no_cdl')
    .required(),

  // OPTIONAL (quiz doesn't use it for now, but we keep it for future)
  state: baseString.max(50).allow('', null),

  // REQUIRED in new quiz (0–100)
  years_exp: Joi.when('cdl_class', {
  is: 'has_cdl',
  then: Joi.string().valid('0_1', '1_3', '3_plus').required(),
  otherwise: Joi.string().allow('').optional(),
}),

  // LEGACY fields — optional for compatibility
  availability: baseString.allow('', null),
  preferred_region: baseString.max(200).allow('', null),

  // truck types (comma-separated string from frontend)
  truck_type_preference: baseString.max(200).allow('', null),

  // used for CDL notes OR non-CDL job description
  notes: baseString.max(2000).allow('', null),
});

// ------------------------------------------------------
// CARRIER LEAD SCHEMA (unchanged)
// ------------------------------------------------------
const carrierSchema = Joi.object({
  lead_type: Joi.string().valid('carrier').required(),

  contact_name: baseString.min(2).max(200).required(),
  company_name: baseString.min(1).max(200).required(),
  phone: baseString.min(5).max(50).required(),
  email: baseString.email().max(200).required(),

  fleet_size: Joi.string()
    .valid('1_10_trucks', '11_50_trucks', '51_200_trucks', '200_plus_trucks')
    .required(),

  lane_type: baseString.max(200).allow('', null),
  hiring_needs: baseString.max(2000).required(),
});

// ------------------------------------------------------
// MAIN VALIDATOR
// ------------------------------------------------------
export function validateLead(payload) {
  let schema;

  if (payload.lead_type === 'driver') {
    schema = driverSchema;
  } else if (payload.lead_type === 'carrier') {
    schema = carrierSchema;
  } else {
    const err = new Error('lead_type must be driver or carrier');
    err.code = 'VALIDATION';
    err.details = [
      { message: 'lead_type must be driver or carrier', path: ['lead_type'] },
    ];
    throw err;
  }

  const { value, error } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const err = new Error('Invalid value');
    err.code = 'VALIDATION';
    err.details = error.details.map(d => ({
      message: d.message,
      path: d.path,
    }));
    throw err;
  }

  return value;
}
