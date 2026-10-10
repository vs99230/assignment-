// All API calls live here. Base URL is '/api' (proxied to staging.fastor.ai in dev).
// To call the server directly, set VITE_API_BASE=https://staging.fastor.ai in a .env file.
const BASE = import.meta.env.VITE_API_BASE || '/api';
const DIAL_CODE = '+91';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error('Network error. Please check your connection.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* response had no JSON body */
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

const form = (obj) => new URLSearchParams(obj).toString();
const formHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };

// Step 1: register and get OTP
export const registerUser = (phone) =>
  request('/v1/pwa/user/register', {
    method: 'POST',
    headers: formHeaders,
    body: form({ phone, dial_code: DIAL_CODE }),
  });

// Step 2: login with OTP -> response.data.token is the JWT
export async function loginWithOtp(phone, otp) {
  const res = await request('/v1/pwa/user/login', {
    method: 'POST',
    headers: formHeaders,
    body: form({ phone, otp, dial_code: DIAL_CODE }),
  });
  const token = res?.data?.token;
  if (!token) throw new Error('Login succeeded but no token was returned.');
  return token;
}

// Step 3: fetch restaurants (Bearer token)
export async function fetchRestaurants(token, cityId = 118) {
  const res = await request(`/v1/m/restaurant?city_id=${cityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = res?.data;
  if (Array.isArray(d)) return d;
  return d?.data || d?.restaurants || d?.results || [];
}
