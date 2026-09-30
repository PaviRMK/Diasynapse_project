/**
 * DiaSynapse API Service
 * Fully integrated client communicating with the FastAPI clinical backend.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (isJson && data?.detail) ||
      (isJson && data?.error) ||
      (isJson && data?.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export function getAuthHeader() {
  const token =
    localStorage.getItem('diasynapse-token') ||
    sessionStorage.getItem('diasynapse-token') ||
    localStorage.getItem('diasynapse_token') ||
    sessionStorage.getItem('diasynapse_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Health check
 */
export async function getStatus() {
  const res = await fetch(`${API_BASE_URL}/`);
  return handleResponse(res);
}

/**
 * Predict glucose 30 minutes ahead
 */
export async function predictGlucose(payload) {
  const requiredInputs = ['glucose', 'insulin_dose', 'glucose_lag_1', 'glucose_lag_6'];
  const missingInput = requiredInputs.find((key) => {
    const value = payload[key];
    return value == null || String(value).trim() === '' || !Number.isFinite(Number(value));
  });
  if (missingInput) {
    throw new Error(`${missingInput} must be a valid number before predicting glucose.`);
  }

  const res = await fetch(`${API_BASE_URL}/predict-glucose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({
      glucose: Number(payload.glucose),
      carbs: payload.carbs == null ? null : Number(payload.carbs),
      insulin_dose: Number(payload.insulin_dose),
      hour: Number(payload.hour ?? new Date().getHours()),
      day_of_week: Number(payload.day_of_week ?? new Date().getDay()),
      glucose_lag_1: Number(payload.glucose_lag_1),
      glucose_lag_6: Number(payload.glucose_lag_6),
      meal_context: payload.meal_context ?? null,
    }),
  });
  return handleResponse(res);
}

export async function logGlucose(glucose) {
  const res = await fetch(`${API_BASE_URL}/log-glucose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ glucose: Number(glucose) }),
  });
  return handleResponse(res);
}

/**
 * Analyze meal photo using Gemini + Nutrition DB (RAG)
 */
export async function analyzeMeal(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/analyze-meal`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return handleResponse(res);
}

/**
 * Check medication situational awareness
 */
export async function checkMedication(payload) {
  const res = await fetch(`${API_BASE_URL}/medication-awareness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({
      last_dose_time: payload.last_dose_time,
      next_scheduled_dose_time: payload.next_scheduled_dose_time,
      meal_carbs: payload.meal_carbs == null ? null : Number(payload.meal_carbs),
      dose_units: payload.dose_units == null ? null : Number(payload.dose_units),
      meal_context: payload.meal_context ?? null,
    }),
  });
  return handleResponse(res);
}

/**
 * Fetch progress report and Firebase logs
 */
export async function getProgressReport(rangeDays = 7) {
  const url = new URL(`${API_BASE_URL}/progress-report`);
  url.searchParams.set('range_days', String(rangeDays));
  const res = await fetch(url.toString(), {
    headers: { ...getAuthHeader() },
  });
  return handleResponse(res);
}

export async function getDashboardData() {
  const res = await fetch(`${API_BASE_URL}/dashboard-data`, {
    headers: { ...getAuthHeader() },
  });
  return handleResponse(res);
}

/**
 * Combined care check: Meal photo analysis + medication awareness + CrewAI summary
 */
export async function runCareCheck(lastDoseTime, nextScheduledDoseTime, file) {
  const url = new URL(`${API_BASE_URL}/care-check`);
  url.searchParams.append('last_dose_time', lastDoseTime);
  url.searchParams.append('next_scheduled_dose_time', nextScheduledDoseTime);

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return handleResponse(res);
}

/**
 * User login
 */
export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

/**
 * User registration
 */
export async function registerUser(data) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      diabetesType: data.diabetesType || 'Type 1',
      dob: data.dob || '2000-01-01',
    }),
  });
  return handleResponse(res);
}

/**
 * Get current authenticated user profile
 */
export async function getMe() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });
  return handleResponse(res);
}

/**
 * Update authenticated user profile
 */
export async function updateProfile(updates) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}
