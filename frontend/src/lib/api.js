
import axios from "axios";
import { getAuth } from "firebase/auth";
const auth = getAuth();
const user = auth.currentUser;
const token = user && await user.getIdToken();

const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export async function pingApi() {
  const res = await api.get("/");
  return res.data;
}

export async function createGroup({ name, description, manager_id }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = user && await user.getIdToken();

  const res = await api.post("/groups/", {
    name,
    description,
    manager_id,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return res.data;
}

// Join a group by code
export async function joinGroup({ group_code, firebase_uid }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = user && await user.getIdToken();
  const res = await api.post(`/groups/${group_code}/members`, {
    firebase_uid,
    role: "contributor"
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return res.data;
}

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


export async function askChatbot(prompt, sessionId) {
  const res = await api.post("/chatbot/ask", {
    prompt,
    session_id: sessionId || undefined,
  });
  return res.data; 
}

// Simulation API (backend routers/simulation.py)
export async function runWhatIfAnalysis(payload) {
  const res = await api.post("/simulation/what-if-analysis", payload);
  return res.data;
}

export async function createSimulationTestGoal() {
  const res = await api.post("/simulation/create-test-goal");
  return res.data; 
}

export async function getGoalSimulations(goalId) {
  const res = await api.get(`/simulation/scenarios/${goalId}`);
  return res.data; 
}
