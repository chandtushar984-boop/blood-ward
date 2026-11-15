export const ALLOWED_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const ALLOWED_AVAILABILITY = ['available', 'not_available'];
export const ALLOWED_GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
export const MIN_DONOR_AGE = 18;
export const MAX_DONOR_AGE = 100;

/**
 * Calculates accurate age from a Date of Birth string or Date object.
 * Returns null if invalid or in future.
 *
 * @param {string|Date} dob
 * @returns {number|null}
 */
export const calculateAgeFromDOB = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Validates donor Date of Birth according to BloodWard adult-only voluntary donor policy (age >= 18).
 *
 * @param {string} dob
 * @returns {{ isValid: boolean, message?: string, age?: number }}
 */
export const validateDonorDOB = (dob) => {
  if (!dob || typeof dob !== 'string' || !dob.trim()) {
    return { isValid: false, message: 'Date of birth is required for donor registration.' };
  }

  const trimmed = dob.trim();
  const birthDate = new Date(trimmed);

  if (Number.isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'Please provide a valid date of birth.' };
  }

  const today = new Date();
  if (birthDate > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future.' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < MIN_DONOR_AGE) {
    return { isValid: false, message: `Voluntary donors must be at least ${MIN_DONOR_AGE} years of age.` };
  }

  if (age > MAX_DONOR_AGE) {
    return { isValid: false, message: 'Please provide a realistic date of birth.' };
  }

  return { isValid: true, age };
};

export const isValidGeoCoordinates = (longitude, latitude) => {
  const lng = Number(longitude);
  const lat = Number(latitude);
  return (
    !Number.isNaN(lng) &&
    !Number.isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
};

export const isValidBloodGroup = (bloodGroup) => {
  return typeof bloodGroup === 'string' && ALLOWED_BLOOD_GROUPS.includes(bloodGroup);
};

export const isValidAvailability = (availability) => {
  return typeof availability === 'string' && ALLOWED_AVAILABILITY.includes(availability);
};

export const isValidGender = (gender) => {
  if (gender === null || gender === undefined || gender === '') return true;
  return typeof gender === 'string' && ALLOWED_GENDERS.includes(gender);
};

export const isValidPincode = (pincode) => {
  if (pincode === null || pincode === undefined || pincode === '') return true;
  if (typeof pincode !== 'string') return false;
  // Standard Indian 6-digit pincode validation if present, or basic length check
  const trimmed = pincode.trim();
  return /^\d{6}$/.test(trimmed) || trimmed.length <= 10;
};

/**
 * Normalizes Indian mobile numbers by safely stripping accepted prefixes (+91, 91, or leading 0).
 * Rejects arbitrary strings or numbers that do not yield an exact 10-digit mobile number starting with 6-9.
 *
 * @param {string} phone
 * @returns {string|null} 10-digit normalized phone number, or null if invalid
 */
export const normalizeIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  // Accepted formats:
  // 1) 10 digits starting with 6-9: 9876543210
  // 2) Optional +91 or 91 with optional space/hyphen: +919876543210, +91 9876543210, +91-9876543210, 919876543210
  // 3) Optional leading 0: 09876543210
  const match = trimmed.match(/^(?:(?:\+91|91)[\s-]?)?([6-9]\d{9})$|^0([6-9]\d{9})$/);
  if (!match) return null;
  return match[1] || match[2];
};

/**
 * Validates if the given string represents a valid Indian mobile number.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidIndianPhone = (phone) => {
  return normalizeIndianPhone(phone) !== null;
};
