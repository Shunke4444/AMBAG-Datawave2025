import axios from "axios";
import { getAuth } from "firebase/auth";

export async function getMyVirtualBalance() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const owner_uid = user.uid;
  const res = await api.get(`/balance/${owner_uid}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Admin: Add a virtual balance for a user (manual top-up)
export async function addVirtualBalance({ amount, goal_title = "Manual Top-up", status = "ready_for_external_payment", balance_type = "manual" }) {
  // If user is logged in, use their UID automatically
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const owner_uid = user.uid;
  const res = await api.post("/balance/add", {
    owner_uid,
    amount,
    goal_title,
    status,
    balance_type
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Approve a member request (manager only)
export async function approveMemberRequest(requestId) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.post(`/request/approve/${requestId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Reject a member request (manager only)
export async function rejectMemberRequest(requestId) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.post(`/request/reject/${requestId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
// Fetch all member requests (for managers)
export async function fetchAllMemberRequests() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.get("/request/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}


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

// Fetch simulation charts for a goal using the old simulation backend
export async function fetchSimulationCharts({ goal_id, prompt, max_charts = 3 }) {
  // Allow missing goal_id for conversational flow
  const payload = { goal_id: goal_id || '', prompt: prompt || '', max_charts };
  try {
    const res = await api.post('/simulation-old/generate-charts', payload);
    // If backend returns a list of goals, handle conversational flow
    if (res.data && res.data.prompt_required && Array.isArray(res.data.goals)) {
      return {
        type: 'goal_list',
        goals: res.data.goals,
        message: res.data.message || 'Please select a goal to analyze.',
      };
    }
    // Otherwise, return chart data as usual
    return res.data;
  } catch (error) {
    console.error('Simulation chart fetch error:', error);
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


export async function createGoal(goalData) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  // Inject role and name so backend logic works correctly
  const completeGoalData = {
    ...goalData,
    creator_role: "member", // or "manager" if logged-in user is a manager
    creator_name: user.displayName || "Unknown User"
  };

  const res = await api.post("/goal/", completeGoalData, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log("✅ API response received:", res.data);
  return res.data;
}


export async function listGoals() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.get("/goal/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function deleteGoal(goalId) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  
  const res = await api.delete(`/goal/${goalId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Get pending goals waiting for approval
export async function listPendingGoals() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  
  const res = await api.get("/goal/pending", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Approve or reject a pending goal
export async function approveOrRejectGoal(goalId, isApproved, managerName, rejectionReason = null) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();

  const requestData = {
    action: isApproved ? "approve" : "reject", // Backend accepts string or bool
    manager_name: managerName,                 // Pass actual manager's name
    rejection_reason: rejectionReason          // Only needed if rejecting
  };

  const res = await api.post(`/goal/pending/${goalId}/approve`, requestData, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
}

export async function createMemberRequest(requestData) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.post("/request/", requestData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Fetch agentic notifications for a goal
export async function fetchAgenticNotifications(goalId) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const res = await api.get(`/ai-tools/notifications/${goalId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Trigger smart reminder for a goal
export async function triggerSmartReminder({ goalId, reminderType = "payment_due", targetMembers = null, urgency = "high", customMessage = null }) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  const payload = {
    group_id: goalId,
    reminder_type: reminderType,
    target_members: targetMembers,
    urgency,
    custom_message: customMessage,
    auto_send: true
  };
  const res = await api.post(`/ai-tools/smart-reminder`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
