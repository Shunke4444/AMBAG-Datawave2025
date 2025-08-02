# AMBAG Agentic Workflow Guide

## Complete End-to-End Workflow: From Group Creation to AI-Powered Autonomous Management

This guide demonstrates the complete workflow of the AMBAG platform, showcasing how traditional group and goal management seamlessly integrates with our advanced agentic AI system.

---

## 🏗️ Phase 1: Foundation Setup

### 1.1 Create a Group
Start by creating a financial group for your shared expenses.

**Endpoint:** `POST /groups/`

```json
{
  "name": "Electric Bill Sharing Group",
  "description": "Monthly electric bill splitting for our apartment",
  "manager_id": "maria_santos"
}
```

**Response:**
```json
{
  "id": "group_123",
  "name": "Electric Bill Sharing Group", 
  "description": "Monthly electric bill splitting for our apartment",
  "members": ["maria_santos"]
}
```

### 1.2 View All Groups
Check existing groups in the system.

**Endpoint:** `GET /groups/`

**Response:**
```json
[
  {
    "id": "group_123",
    "name": "Electric Bill Sharing Group",
    "description": "Monthly electric bill splitting for our apartment", 
    "members": ["maria_santos", "john_cruz", "jane_dela_cruz"]
  }
]
```

---

## 🎯 Phase 2: Goal Management

### 2.1 Create a Financial Goal
Set up a savings/expense goal for your group.

**Endpoint:** `POST /goal/`

```json
{
  "title": "December Electric Bill",
  "goal_amount": 5000.0,
  "description": "Monthly electric bill for apartment",
  "creator_role": "manager",
  "creator_name": "maria_santos",
  "target_date": "2025-12-31"
}
```

**Response:**
```json
{
  "id": "goal_456",
  "title": "December Electric Bill",
  "goal_amount": 5000.0,
  "current_amount": 0.0,
  "creator_name": "maria_santos",
  "creator_role": "manager",
  "target_date": "2025-12-31",
  "status": "active",
  "created_at": "2025-07-30T10:00:00"
}
```

### 2.2 View All Goals
Monitor all financial goals in the system.

**Endpoint:** `GET /goal/`

**Response:**
```json
[
  {
    "id": "goal_456",
    "title": "December Electric Bill",
    "goal_amount": 5000.0,
    "current_amount": 1500.0,
    "status": "active",
    "creator_name": "maria_santos",
    "target_date": "2025-12-31"
  }
]
```

### 2.3 Member Contributions
Group members contribute to the goal.

**Endpoint:** `POST /goal/{goal_id}/contribute`

```json
{
  "amount": 1000.0,
  "contributor_name": "john_cruz",
  "payment_method": "bank_transfer",
  "reference_number": "BPI123456789"
}
```

### 2.4 Goal Approval Workflow (if member-created)
For member-created goals, managers must approve.

**Endpoint:** `POST /goal/pending/{goal_id}/approve`

```json
{
  "action": "approve",
  "manager_name": "maria_santos"
}
```

---

## 🤖 Phase 3: Agentic AI Integration

This is where AMBAG becomes truly intelligent and autonomous.

### 3.1 Comprehensive AI Analysis with Autonomous Execution
The AI analyzes your goal and automatically executes actions.

**Endpoint:** `POST /ai-tools/comprehensive-analysis`

```json
{
  "group_id": "goal_456",
  "analysis_types": ["progress_tracking", "risk_assessment", "optimization", "predictions"],
  "auto_execute": true
}
```

**Response:**
```json
{
  "analysis_id": "analysis_goal_456_20250730_140000",
  "group_id": "goal_456",
  "analysis": {
    "progress_tracking": {
      "current_progress": 60.0,
      "milestone_status": "on_track",
      "completion_trend": "positive"
    },
    "risk_assessment": {
      "deadline_risk": "medium",
      "member_participation": "good",
      "payment_velocity": "acceptable"
    },
    "recommended_actions": [
      {
        "action_type": "send_reminder",
        "target_members": ["mike_reyes", "sarah_garcia"],
        "action_data": {
          "amount_due": 1000.0,
          "deadline": "2025-12-31",
          "urgency": "medium"
        }
      }
    ]
  },
  "autonomous_actions_triggered": ["send_reminder"],
  "auto_execute": true,
  "timestamp": "2025-07-30T14:00:00"
}
```

**🎯 What Happens Automatically:**
- AI analyzes goal progress, risks, and patterns
- Identifies members who haven't contributed
- **Automatically sends personalized reminders** to late contributors
- **Escalates to manager** if deadline approaches with low progress
- **Triggers fund transfer alerts** when goal is completed
- All actions execute in the background without human intervention

### 3.2 Smart AI-Powered Reminders
Generate and automatically send intelligent reminders.

**Endpoint:** `POST /ai-tools/smart-reminder`

```json
{
  "group_id": "goal_456",
  "reminder_type": "payment_due",
  "urgency": "medium",
  "auto_send": true,
  "target_members": ["mike_reyes", "sarah_garcia"]
}
```

**Response:**
```json
{
  "reminder_id": "reminder_goal_456_20250730_140500",
  "group_id": "goal_456",
  "generated_reminder": {
    "message": "Hi Mike! 👋 Your ₱1,000 share is due by Dec 31. Only ₱2,000 left to reach your goal! 🎯",
    "urgency_level": "medium",
    "personalized_amount_due": 1000.0
  },
  "auto_sent_to": ["mike_reyes", "sarah_garcia"],
  "auto_send": true
}
```

---

## 📊 Phase 4: Monitoring & Analytics

### 4.1 View Autonomous Notifications
See all AI-generated notifications for a goal.

**Endpoint:** `GET /ai-tools/notifications/{group_id}`

**Response:**
```json
{
  "group_id": "goal_456",
  "notifications": [
    {
      "id": "rem_goal_456_mike_reyes_20250730_140000",
      "type": "contributor_reminder",
      "recipient": "mike_reyes",
      "message": "Hi Mike! 👋 Your ₱1,000 share is due by Dec 31...",
      "channel": "sms",
      "status": "sent",
      "auto_generated": true,
      "timestamp": "2025-07-30T14:00:00"
    }
  ],
  "count": 15
}
```

### 4.2 View Executed Autonomous Actions
Track all AI-executed actions for accountability.

**Endpoint:** `GET /ai-tools/executed-actions/{group_id}`

**Response:**
```json
{
  "group_id": "goal_456",
  "executed_actions": [
    {
      "action_type": "send_reminder",
      "targets": ["mike_reyes", "sarah_garcia"],
      "notifications_sent": 2,
      "autonomous": true,
      "timestamp": "2025-07-30T14:00:00"
    },
    {
      "action_type": "escalate_manager",
      "urgency": "medium",
      "autonomous": true,
      "timestamp": "2025-07-30T12:30:00"
    }
  ],
  "count": 5
}
```

### 4.3 System-Wide Dashboard
Get overview of all goals and AI activity.

**Endpoint:** `GET /ai-tools/dashboard-summary`

**Response:**
```json
{
  "dashboard_summary": {
    "total_goals": 12,
    "active_goals": 8,
    "completed_goals": 3,
    "awaiting_payment_goals": 1,
    "total_notifications": 45,
    "total_executed_actions": 23,
    "total_analyses": 15,
    "goals": [
      {
        "id": "goal_456",
        "title": "December Electric Bill",
        "status": "active",
        "progress_percentage": 60.0,
        "days_remaining": 154,
        "members": 5,
        "contributors": 3
      }
    ]
  }
}
```

---

## 🤝 Phase 5: Human-AI Collaboration

### 5.1 Chatbot Integration
Get AI assistance for goal management.

**Endpoint:** `POST /chatbot/ask`

```json
{
  "prompt": "How is our December Electric Bill goal progressing?",
  "session_id": "user_session_123"
}
```

### 5.2 Scheduler Monitoring
The background scheduler continuously monitors goals.

**Endpoint:** `GET /scheduler/status`

**Response:**
```json
{
  "scheduler_status": "running",
  "goals_monitored": 8,
  "last_analysis": "2025-07-30T13:45:00",
  "next_scheduled_run": "2025-07-30T14:45:00"
}
```

---

## 🚀 Complete Agentic Workflow Example

### Scenario: Monthly Electric Bill Management

1. **👥 Setup (Human)**
   - Create group: `POST /groups/`
   - Create goal: `POST /goal/`

2. **💰 Contributions (Human)**
   - Members contribute: `POST /goal/{goal_id}/contribute`
   - Progress tracked automatically

3. **🤖 AI Takes Over (Autonomous)**
   - Scheduler monitors: Background process
   - AI analyzes: `POST /ai-tools/comprehensive-analysis` (auto-triggered)
   - Smart actions executed automatically:
     - Reminders sent to late contributors
     - Manager escalation for risks
     - Fund transfer alerts when complete

4. **📊 Monitoring (Human + AI)**
   - View notifications: `GET /ai-tools/notifications/{group_id}`
   - Check executed actions: `GET /ai-tools/executed-actions/{group_id}`
   - Dashboard overview: `GET /ai-tools/dashboard-summary`

5. **💸 Completion (AI-Assisted)**
   - Goal completion detected automatically
   - Fund transfer alerts sent to manager
   - Contributors notified of success
   - Payout processed: `POST /goal/{goal_id}/payout`

---

## 🎯 Key Agentic Features

### Autonomous Decision Making
- ✅ Risk assessment and deadline monitoring
- ✅ Automatic reminder scheduling based on contribution patterns
- ✅ Escalation to managers when intervention needed
- ✅ Fund transfer alerts when goals completed

### Intelligent Communication
- ✅ Personalized messages in Filipino-English mix (Taglish)
- ✅ Context-aware reminders with specific amounts and deadlines
- ✅ Cultural sensitivity and motivational messaging

### Real-Time Monitoring
- ✅ Continuous background goal monitoring
- ✅ Pattern recognition for member behavior
- ✅ Proactive problem identification and resolution

### Seamless Integration
- ✅ Works with existing goal and group management
- ✅ No disruption to current user workflows
- ✅ Enhanced with intelligent automation

---

## 🔧 Testing Your Agentic System

### Create Test Scenario
**Endpoint:** `POST /ai-tools/create-test-scenario`

This creates a complete test goal with contributions to test the agentic features.

### Test Complete Workflow
**Endpoint:** `POST /ai-tools/test-agentic-workflow`

```json
{
  "goal_id": "test_goal_123"
}
```

This tests the entire agentic workflow with a real goal.

---

## 📈 Benefits of the Agentic Approach

1. **Reduced Manual Work**: AI handles routine reminders and monitoring
2. **Improved Collection Rates**: Proactive, personalized communication
3. **Better Risk Management**: Early detection of potential issues
4. **Enhanced User Experience**: Intelligent, context-aware interactions
5. **Scalability**: System manages hundreds of goals autonomously
6. **Cultural Sensitivity**: AI understands Filipino financial collaboration patterns

---

This workflow demonstrates how AMBAG transforms from a simple goal tracking system into an intelligent, autonomous financial collaboration platform that works alongside users to ensure successful goal completion.