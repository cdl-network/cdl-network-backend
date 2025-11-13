// src/validation/leadSchema.js
import Joi from 'joi';

const baseString = Joi.string().trim();

const driverSchema = Joi.object({
  lead_type: Joi.string().valid('driver').required(),

  full_name: baseString.min(2).max(200).required(),
  phone: baseString.min(5).max(50).required(),
  email: baseString.email().max(200).required(),

  cdl_class: Joi.string().valid('yes', 'no').required(),
  state: baseString.min(2).max(50).required(),

  years_exp: Joi.number().integer().min(0).max(80).required(),

  availability: Joi.string()
    .valid('immediate', '2_weeks', '1_month')
    .allow(null, ''),

  preferred_region: baseString.max(200).allow('', null),
  truck_type_preference: baseString.max(200).allow('', null),
  notes: baseString.max(2000).allow('', null),
});

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

export function validateLead(payload) {
  let schema;

  if (payload.lead_type === 'driver') {
    schema = driverSchema;
  } else if (payload.lead_type === 'carrier') {
    schema = carrierSchema;
  } else {
    const err = new Error('lead_type must be driver or carrier');
    err.code = 'VALIDATION';
    err.details = [{ message: 'lead_type must be driver or carrier', path: ['lead_type'] }];
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
