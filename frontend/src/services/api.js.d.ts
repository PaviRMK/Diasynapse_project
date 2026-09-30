declare module '@/services/api.js' {
  export const API_BASE_URL: string;
  export class ApiError extends Error {
    status: number;
    data: any;
  }
  export function getAuthHeader(): Record<string, string>;
  export function getStatus(): Promise<{ message: string }>;
  export type MealAgentContext = {
    items: Array<{
      food_name: string;
      estimated_carbs_g: number;
      matched_database_dish?: string | null;
      source?: string | null;
    }>;
    gemini_confidence?: string | null;
    timestamp?: string | null;
  };
  export function predictGlucose(
    payload: Record<string, number | string | MealAgentContext | null>
  ): Promise<any>;
  export function logGlucose(glucose: number): Promise<any>;
  export function analyzeMeal(file: File): Promise<any>;
  export function checkMedication(payload: {
    last_dose_time: string;
    next_scheduled_dose_time: string;
    meal_carbs?: number | null;
    dose_units?: number;
    meal_context?: MealAgentContext | null;
  }): Promise<any>;
  export function getProgressReport(rangeDays?: number): Promise<any>;
  export function getDashboardData(): Promise<any>;
  export function runCareCheck(
    lastDoseTime: string,
    nextScheduledDoseTime: string,
    file: File
  ): Promise<any>;
  export function loginUser(credentials: { email: string; password: string }): Promise<any>;
  export function registerUser(data: {
    name: string;
    email: string;
    password: string;
    diabetesType?: string;
    dob?: string;
  }): Promise<any>;
  export function getMe(): Promise<{ user: any }>;
  export function updateProfile(updates: {
    name?: string | undefined;
    diabetesType?: string | undefined;
    medicationType?: string | undefined;
    dob?: string | undefined;
  }): Promise<{ user: any; message: string }>;
}
