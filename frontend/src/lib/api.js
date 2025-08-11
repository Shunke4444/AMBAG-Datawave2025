// Centralized API client and helpers
import axios from 'axios';

const baseURL = import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add timeout
});

// Chatbot
export async function askChatbot(payload) {
  const body = { prompt: payload?.prompt };
  if (payload?.session_id) body.session_id = payload.session_id;
  try {
    const { data } = await api.post('/chatbot/ask', body);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data || err?.message;
    throw err;
  }
}

// Simulation / What-If
export async function createSimulationTestGoal() {
  const { data } = await api.post('/simulation/create-test-goal');
  return data;
}

export async function runWhatIfAnalysis({ goal_id, prompt, max_charts = 3 }) {
  const { data } = await api.post('/simulation/generate-charts', {
    goal_id,
    prompt,
    max_charts
  });
  return data;
}

export async function getGoalSimulations(goal_id) {
  const { data } = await api.get(`/simulation/scenarios/${goal_id}`);
  return data;
}

// Health
export async function pingApi() {
  const { data } = await api.get('/');
  return data;
}

export default api;
