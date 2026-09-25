const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
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
    const errorMessage = (isJson && data?.detail) || 
                         (isJson && data?.error) || 
                         (isJson && data?.message) || 
                         `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const api = {
  /**
   * Health check
   */
  async getStatus() {
    const res = await fetch(`${API_BASE_URL}/`);
    return handleResponse(res);
  },

  /**
   * Predict glucose 30 minutes ahead
   * @param {Object} payload { glucose, carbs, insulin_dose, hour, day_of_week, glucose_lag_1, glucose_lag_6 }
   */
  async predictGlucose(payload) {
    const res = await fetch(`${API_BASE_URL}/predict-glucose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        glucose: Number(payload.glucose),
        carbs: Number(payload.carbs),
        insulin_dose: Number(payload.insulin_dose),
        hour: Number(payload.hour),
        day_of_week: Number(payload.day_of_week),
        glucose_lag_1: Number(payload.glucose_lag_1),
        glucose_lag_6: Number(payload.glucose_lag_6),
      }),
    });
    return handleResponse(res);
  },

  /**
   * Analyze a meal photo
   * @param {File} file
   */
  async analyzeMeal(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/analyze-meal`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  /**
   * Check medication situational awareness
   * @param {Object} payload { last_dose_time, next_scheduled_dose_time, meal_carbs }
   */
  async checkMedication(payload) {
    const res = await fetch(`${API_BASE_URL}/medication-awareness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        last_dose_time: payload.last_dose_time,
        next_scheduled_dose_time: payload.next_scheduled_dose_time,
        meal_carbs: Number(payload.meal_carbs),
      }),
    });
    return handleResponse(res);
  },

  /**
   * Fetch progress report from Firebase
   */
  async getProgressReport() {
    const res = await fetch(`${API_BASE_URL}/progress-report`);
    return handleResponse(res);
  },

  /**
   * Combined care check: Meal photo analysis + medication situational awareness + CrewAI summary
   * @param {string} lastDoseTime ISO datetime string
   * @param {string} nextScheduledDoseTime ISO datetime string
   * @param {File} file
   */
  async runCareCheck(lastDoseTime, nextScheduledDoseTime, file) {
    const url = new URL(`${API_BASE_URL}/care-check`);
    url.searchParams.append('last_dose_time', lastDoseTime);
    url.searchParams.append('next_scheduled_dose_time', nextScheduledDoseTime);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  /**
   * User login
   * @param {Object} credentials { email, password }
   */
  async login(credentials) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error('Unable to connect to authentication server. Please check your connection or try again later.');
    }
  },

  /**
   * User registration
   * @param {Object} data { name, email, password, diabetesType, dob }
   */
  async register(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error('Unable to connect to authentication server. Please check your connection or try again later.');
    }
  },

  /**
   * Get current authenticated user profile
   * @param {string} token
   */
  async getMe(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await handleResponse(res);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error('Unable to connect to authentication server. Please check your connection or try again later.');
    }
  },

  /**
   * Update authenticated user profile
   * @param {string} token
   * @param {Object} updates
   */
  async updateProfile(token, updates) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error('Unable to connect to authentication server. Please check your connection or try again later.');
    }
  },
};
