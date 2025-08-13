// Generate AI-driven charts for What-If (debug helper)
export async function generateSimulationCharts({ goal_id, prompt, max_charts = 3 }) {
  // Ensure goal_id is provided
  if (!goal_id) throw new Error('goal_id is required');
  const url = '/simulation/generate-charts';
  const payload = { goal_id, prompt, max_charts };
  console.log('[generateSimulationCharts] POST', url, payload);
  try {
    const res = await api.post(url, payload);
    console.log('[generateSimulationCharts] Response:', res.status, res.data);
    return res.data; // { narrative, charts }
  } catch (error) {
    if (error.response) {
      console.error('[generateSimulationCharts] Error response:', error.response.status, error.response.data);
    } else {
      console.error('[generateSimulationCharts] Error:', error);
    }
    throw error;
  }
}
// Minimal Axios client for FastAPI backend (JS)
import axios from "axios";

const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export async function pingApi() {
  const res = await api.get("/");
  return res.data;
}

export async function askChatbot(prompt, sessionId) {
  const res = await api.post("/chatbot/ask", {
    prompt,
    session_id: sessionId || undefined,
  });
  return res.data; // { response, session_id }
}

// Simulation API (backend routers/simulation.py)
export async function runWhatIfAnalysis(payload) {
  // payload shape: { goal_id, scenarios: [{scenario_type, description, parameters}], explain_outcomes?, advisor_mode? }
  const res = await api.post("/simulation/what-if-analysis", payload);
  return res.data;
}

export async function createSimulationTestGoal() {
  const res = await api.post("/simulation/create-test-goal");
  return res.data; // { goal_id, ready_for_simulation, ... }
}

export async function getGoalSimulations(goalId) {
  const res = await api.get(`/simulation/scenarios/${goalId}`);
  return res.data; // { simulations, count }
}
