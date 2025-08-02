---
# AMBAG Backend API Documentation
## Complete System Guide: From User Registration to AI-Powered Financial Management

### 🎯 What is AMBAG?
AMBAG is an intelligent Filipino financial collaboration platform that helps groups (families, barkada, office teams) save money together, split bills, and achieve shared financial goals using AI automation and bank-free payment systems.

**Key Features:**
- 👥 Group-based financial management with role-based permissions
- 🎯 Collaborative goal setting with approval workflows
- 🤖 AI-powered reminders and autonomous actions
- 📊 What-if scenario simulations and performance analysis
- 💡 Intelligent decision-making system with agentic workflows
- 📱 Real-time progress monitoring and notifications
- 💳 Bank-free auto payment system (BPI, Virtual Balance)
- 🔐 Session-based authentication and user management
- ⏰ Background scheduler for automated monitoring
- 💬 AI chatbot for financial advice and guidance

---

## 🔄 Complete User Journey: Step-by-Step Flow

### Phase 1: User Onboarding & Authentication

#### Step 1: User Registration
**Endpoint:** `POST /users/register`
**Purpose:** Create a new user account with complete profile and role-based permissions
**Router:** `users.py`

```json
{
  "email": "maria.santos@gmail.com",
  "password": "securePassword123",
  "profile": {
    "first_name": "Maria",
    "last_name": "Santos", 
    "contact_number": "+639171234567",
    "address": "123 Rizal St, Quezon City",
    "emergency_contact": "Juan Santos",
    "emergency_contact_number": "+639189876543"
  },
  "role": {
    "role_type": "manager",
    "permissions": ["create_goals", "approve_goals", "manage_group", "view_analytics"],
    "group_id": null
  }
}
```

**Response:**
```json
{
  "id": "user_maria_santos_uuid",
  "email": "maria.santos@gmail.com",
  "profile": { ... },
  "role": { ... },
  "is_active": true,
  "created_at": "2025-08-02T10:00:00Z",
  "groups": []
}
```

#### Step 2: User Login & Session Management
**Endpoint:** `POST /users/login`
**Purpose:** Authenticate user and create secure session

```json
{
  "email": "maria.santos@gmail.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user_id": "user_maria_santos_uuid",
  "session_token": "session_token_uuid",
  "user": {
    "id": "user_maria_santos_uuid",
    "email": "maria.santos@gmail.com",
    "profile": { ... },
    "role": { ... },
    "last_login": "2025-08-02T10:05:00Z",
    "groups": []
  }
}
```

### Phase 2: Group Management

#### Step 3: Group Creation
**Endpoint:** `POST /groups/`
**Purpose:** Create a financial group for collaboration
**Router:** `groups.py`

```json
{
  "name": "Santos Family Bills",
  "manager_id": "user_maria_santos_uuid",
  "description": "Monthly household expenses sharing"
}
```

**Response:**
```json
{
  "id": "group_santos_family_uuid",
  "name": "Santos Family Bills",
  "manager_id": "user_maria_santos_uuid",
  "members": [
    {
      "user_id": "user_maria_santos_uuid",
      "role": "manager",
      "joined_at": "2025-08-02T10:00:00Z",
      "contribution_total": 0.0,
      "is_active": true
    }
  ],
  "created_at": "2025-08-02T10:00:00Z",
  "is_active": true,
  "total_goals": 0,
  "total_contributions": 0.0,
  "member_count": 1
}
```

#### Step 4: Add Group Members
**Endpoint:** `POST /groups/{group_id}/members`
**Purpose:** Add family/friends to the group

```json
{
  "user_id": "user_pedro_santos_uuid",
  "role": "contributor"
}
```

### Phase 3: Goal Management & Bank-Free Payments

#### Step 5: Create Financial Goal with Auto Payment
**Endpoint:** `POST /goal/`
**Purpose:** Set up a shared financial target with bank-free auto payment
**Router:** `goal.py`

```json
{
  "title": "Electric Bill - March 2025",
  "goal_amount": 5500.0,
  "description": "Meralco bill for March 2025",
  "creator_role": "manager",
  "creator_name": "Maria Santos",
  "target_date": "2025-03-25",
  "auto_payment_settings": {
    "enabled": true,
    "payment_method": "virtual_balance",
    "recipient_details": {
      "gcash_number": "+639171234567",
      "account_name": "Maria Santos"
    },
    "require_confirmation": false,
    "auto_complete_threshold": 10000.0,
    "notification_settings": {
      "notify_manager": true,
      "notify_contributors": true,
      "send_receipt": true
    }
  }
}
```

**Response:**
```json
{
  "id": "goal_electric_march_uuid",
  "title": "Electric Bill - March 2025",
  "goal_amount": 5500.0,
  "current_amount": 0.0,
  "status": "active",
  "created_at": "2025-08-02T10:30:00Z",
  "auto_payment_settings": { ... },
  "is_paid": false
}
```

#### Step 6: Goal Approval Workflow
**Endpoint:** `GET /goal/pending`
**Purpose:** View goals awaiting manager approval (for member-created goals)

**Endpoint:** `POST /goal/pending/{goal_id}/approve`
**Purpose:** Manager approves or rejects pending goals

```json
{
  "action": "approve",
  "manager_name": "Maria Santos",
  "rejection_reason": null
}
```

#### Step 7: Members Contribute
**Endpoint:** `POST /goal/{goal_id}/contribute`
**Purpose:** Members add their share to the goal

```json
{
  "amount": 1375.0,
  "contributor_name": "Pedro Santos",
  "payment_method": "gcash",
  "reference_number": "GCH240802001"
}
```

**Response (with Auto Payment Trigger):**
```json
{
  "message": "₱1375.0 contributed by Pedro Santos",
  "goal": {
    "id": "goal_electric_march_uuid",
    "current_amount": 5500.0,
    "status": "completed"
  },
  "remaining_amount": 0.0,
  "progress_percentage": 100.0,
  "auto_payment": {
    "message": "Virtual payment completed for 'Electric Bill - March 2025'",
    "payout_balance_id": "payout_goal_electric_march_uuid",
    "amount": 5500.0,
    "status": "completed",
    "note": "Funds transferred to virtual payout balance"
  }
}
```

### Phase 4: Bank-Free Auto Payment System

#### Payment Methods Available:

1. **Virtual Balance (Instant Transfer)**
   - Funds instantly transferred to virtual payout balance
   - Goal marked as completed immediately
   - Manager can withdraw externally later

2. **BPI Bank Transfer**
   - Creates detailed bank transfer instructions
   - Includes account numbers and proper references

3. **Manual Payment Options**
   - Provides multiple payment options (GCash, bank, cash)
   - Flexible for different situations

#### Auto Payment Endpoints:

**Setup Auto Payment:**
```http
POST /goal/{goal_id}/auto-payment/setup
```

**Check Auto Payment Status:**
```http
GET /goal/{goal_id}/auto-payment/status
```

**Manager Confirmation (When Required):**
```http
POST /goal/{goal_id}/auto-payment/confirm
```

**View Auto Payment Queue:**
```http
GET /goal/auto-payment/queue
```

**View Virtual Balances:**
```http
GET /goal/virtual-balances
```

### Phase 5: AI-Powered Automation & Agentic Workflows

#### Step 8: Smart Reminders (Auto or Manual)
**Endpoint:** `POST /ai-tools/smart-reminder`
**Purpose:** AI generates and sends personalized reminders
**Router:** `ai_tools_clean.py`

```json
{
  "group_id": "goal_electric_march_uuid",
  "reminder_type": "payment_due",
  "target_members": ["Juan Santos", "Ana Santos"],
  "urgency": "high",
  "custom_message": "Kuya, deadline na bukas! Please pay na 🙏",
  "auto_send": true
}
```

**AI-Generated Response:**
```json
{
  "reminder_id": "reminder_goal_electric_march_uuid_20250802_143000",
  "generated_reminder": {
    "message": "Hi Juan! 👋 Kulang pa tayo ng ₱2,750 para sa electric bill! Your share: ₱1,375. Deadline: March 25 (bukas na!). Saglit lang, GCash mo na para hindi ma-disconnect 😅⚡",
    "urgency_level": "high",
    "suggested_actions": [
      "Pay via GCash: +639171234567",
      "Ask for payment plan if needed", 
      "Contact group manager"
    ]
  },
  "auto_sent_to": ["Juan Santos", "Ana Santos"],
  "timestamp": "2025-08-02T14:30:00Z"
}
```

#### Step 9: Agentic Actions (Autonomous AI)
**Endpoint:** `POST /ai-tools/agentic-action`
**Purpose:** AI autonomously decides and executes best actions

```bash
POST /ai-tools/agentic-action?goal_id=goal_electric_march_uuid
```

**AI Decision Process:**
```json
{
  "success": true,
  "group_id": "goal_electric_march_uuid",
  "action_type": "agentic_autonomous",
  "message": "System will autonomously determine and execute the best action",
  "analytics": {
    "total_members": 4,
    "contributors": 2,
    "non_contributors": 2,
    "progress_percentage": 75.0,
    "remaining_amount": 1375.0,
    "days_remaining": 1,
    "urgency_assessment": "critical"
  },
  "ai_decision": "Escalate to manager due to critical deadline",
  "actions_executed": [
    "Critical reminder sent to late members",
    "Manager alert triggered",
    "Payment plan suggested for struggling members"
  ]
}
```

### Phase 6: Advanced Analytics & Simulations

#### Step 10: What-If Simulations
**Endpoint:** `POST /simulation/what-if-analysis`
**Purpose:** Test different scenarios before making decisions
**Router:** `simulation.py`

```json
{
  "goal_id": "goal_electric_march_uuid",
  "scenarios": [
    {
      "scenario_type": "goal_amount",
      "description": "What if bill increases by ₱1,000?",
      "parameters": { "new_goal_amount": 6500.0 }
    },
    {
      "scenario_type": "add_member",
      "description": "What if we add Tita Rosa?",
      "parameters": { 
        "member_name": "Rosa Santos", 
        "expected_contribution": 1300.0 
      }
    },
    {
      "scenario_type": "deadline_extension",
      "description": "What if we extend deadline by 1 week?",
      "parameters": { "new_deadline": "2025-04-01" }
    }
  ],
  "explain_outcomes": true,
  "advisor_mode": true
}
```

**Simulation Results:**
```json
{
  "simulation_id": "sim_20250802_143000",
  "goal_id": "goal_electric_march_uuid",
  "scenarios_analyzed": 3,
  "results": [
    {
      "scenario": "goal_amount_increase",
      "outcome": {
        "new_per_member_share": 1625.0,
        "additional_amount_per_member": 250.0,
        "feasibility": "medium",
        "risk_level": "low"
      },
      "ai_advice": "Medyo malaki ang increase pero kaya pa naman. Suggest na mag-advance notice sa mga members para maka-prepare sila financially."
    },
    {
      "scenario": "add_member",
      "outcome": {
        "new_per_member_share": 1300.0,
        "savings_per_original_member": 75.0,
        "feasibility": "high",
        "risk_level": "very_low"
      },
      "ai_advice": "Magandang idea! Bababa ang share ng lahat from ₱1,375 to ₱1,300. Plus reliable si Tita Rosa sa payments based on family history."
    }
  ],
  "overall_recommendation": "Add Rosa Santos to reduce individual burden. The goal increase is manageable with 5 members instead of 4.",
  "confidence_score": 0.87
}
```

#### Step 11: Chatbot Consultation
**Endpoint:** `POST /chatbot/ask`
**Purpose:** Get AI financial advice and guidance
**Router:** `chatbot.py`

```json
{
  "message": "Should we increase our emergency fund goal from ₱10,000 to ₱15,000?",
  "context": {
    "user_id": "user_maria_santos_uuid",
    "current_goals": ["goal_electric_march_uuid"],
    "group_performance": "good"
  }
}
```

**Chatbot Response:**
```json
{
  "response": "Good idea, Maria! Based on your group's track record, ₱15,000 emergency fund is mas practical. Ang inyong family ay may consistent na ₱5,500 monthly bills, so 3 months coverage talaga ang ideal. I recommend gradual increase - add ₱1,000 per month para hindi masyadong shock sa budget. Want ko mag-simulate kung paano makaka-achieve ito?",
  "suggested_actions": [
    "Run simulation for gradual goal increase",
    "Set up automatic reminders for extra contributions",
    "Create separate goal for emergency fund boost"
  ],
  "confidence": 0.92
}
```

---

## 🔗 Router Connections & Data Flow

### Router Relationship Map

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USERS    │───▶│   GROUPS    │───▶│    GOALS    │
│             │    │             │    │             │
│ • Register  │    │ • Create    │    │ • Create    │
│ • Login     │    │ • Add Members│    │ • Contribute│
│ • Profile   │    │ • Manage    │    │ • Track     │
│ • Sessions  │    │ • Statistics│    │ • Auto Pay  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                AI TOOLS ENGINE                      │
│                                                     │
│ • Smart Reminders  • Agentic Actions               │
│ • Risk Analysis    • Autonomous Decisions          │
│ • Notifications    • Performance Monitoring        │
│ • Test Scenarios   • Dashboard Analytics           │
└─────────────────────────────────────────────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ SIMULATION  │    │  SCHEDULER  │    │   CHATBOT   │
│             │    │             │    │             │
│ • What-if   │    │ • Monitor   │    │ • Advice    │
│ • Scenarios │    │ • Auto-run  │    │ • Q&A       │
│ • Analytics │    │ • Health    │    │ • Guidance  │
│ • Dashboard │    │ • Triggers  │    │ • Context   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Data Flow Examples

#### 1. **New Contribution Triggers Auto Payment**
```
Member contributes → Goal reaches target → Auto payment enabled? → 
Virtual Balance: Instant completion → AI notification sent
```

#### 2. **Deadline Approaching Workflow**
```
Scheduler checks → Goal near deadline → AI assesses risk → 
Agentic action decides → Send critical alerts → Escalate to manager
```

#### 3. **Simulation to Implementation**
```
User runs simulation → AI provides recommendations → 
User implements changes → System updates goals → 
Continue monitoring → Auto payment processes
```

#### 4. **User Authentication Flow**
```
User registers → Session created → Group access granted → 
Goal participation → AI monitoring → Payment completion
```

---

## 📚 Complete Endpoint Reference

### 👤 Users Router (`/users`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/register` | POST | Create new user account with role-based permissions | New member joins AMBAG |
| `/login` | POST | Authenticate user and create session | Member logs in to access groups |
| `/logout` | POST | Invalidate user session | Member logs out securely |
| `/profile/{user_id}` | GET | Get user details and group memberships | Check member profile info |
| `/profile/{user_id}` | PUT | Update user profile or role | Change contact info or permissions |
| `/profile/{user_id}` | DELETE | Delete user account and cleanup | Remove inactive member |
| `/` | GET | Get all users (admin function) | System administration |
| `/join-group` | POST | Add user to specific group | Member joins family group |
| `/leave-group` | POST | Remove user from group | Member leaves group |
| `/by-role/{role_type}` | GET | Get users by role (manager/contributor) | Find all managers |
| `/managers` | GET | Get all manager users | Admin oversight |
| `/contributors` | GET | Get all contributor users | Member management |
| `/session/{session_token}` | GET | Get current user by session | Validate active session |
| `/create-test-users` | POST | Create development test users | Testing and development |

### 👥 Groups Router (`/groups`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/` | POST | Create new group with manager | Family starts bill sharing |
| `/` | GET | List all active groups | Browse available groups |
| `/{group_id}` | GET | Get group details and member list | View group information |
| `/{group_id}` | PUT | Update group name/description | Modify group settings |
| `/{group_id}` | DELETE | Deactivate group | Disband family group |
| `/{group_id}/members` | POST | Add member to group | Invite cousin to join |
| `/{group_id}/members` | GET | List all group members | Check group membership |
| `/{group_id}/members/{user_id}` | DELETE | Remove member from group | Remove inactive member |
| `/{group_id}/members/{user_id}/role` | PUT | Update member role | Promote to co-manager |
| `/user/{user_id}` | GET | Get all groups for user | View user's group memberships |
| `/{group_id}/stats` | GET | Get group statistics and analytics | Performance metrics |
| `/create-test-group` | POST | Create test group for development | Testing purposes |

### 🎯 Goals Router (`/goal`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/` | POST | Create new financial goal with auto payment | Set up electric bill goal |
| `/` | GET | List all active goals | View all family goals |
| `/{goal_id}` | GET | Get specific goal details | Check electric bill progress |
| `/{goal_id}` | DELETE | Delete goal | Remove cancelled goal |
| `/{goal_id}/contribute` | POST | Add contribution to goal | Member pays their share |
| `/{goal_id}/contributors` | GET | View all contributors and amounts | See who has paid |
| `/{goal_id}/status` | PUT | Update goal status | Mark as completed/cancelled |
| `/{goal_id}/payout` | POST | Process manual payout | Manager approves payment |
| `/pending` | GET | Get goals awaiting approval | Manager reviews new goals |
| `/pending/{goal_id}/approve` | POST | Approve/reject pending goal | Manager approves member goal |

### 💳 Bank-Free Auto Payment Endpoints (`/goal`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/{goal_id}/auto-payment/setup` | POST | Configure auto payment settings | Enable virtual balance auto pay |
| `/{goal_id}/auto-payment/status` | GET | Get auto payment configuration | Check payment method setup |
| `/{goal_id}/auto-payment/confirm` | POST | Manager confirms/rejects auto payment | Approve auto payment queue |
| `/auto-payment/queue` | GET | Get pending auto payments | View payments awaiting confirmation |
| `/virtual-balances` | GET | Get all virtual payout balances | Check available balances |


### 🤖 AI Tools Router (`/ai-tools`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/smart-reminder` | POST | Send AI-generated reminders | Remind late members in Taglish |
| `/agentic-action` | POST | Trigger autonomous AI actions | Let AI decide best action |
| `/notifications/{group_id}` | GET | Get notification history for group | View sent messages |
| `/executed-actions/{group_id}` | GET | Get AI action history | See AI decisions made |
| `/dashboard-summary` | GET | System overview and analytics | Admin dashboard data |
| `/create-test-scenario` | POST | Create test data for development | Development testing |
| `/test-agentic-workflow` | POST | Test complete AI workflow | End-to-end AI testing |

### 📊 Simulation Router (`/simulation`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/what-if-analysis` | POST | Run scenario simulations | Test goal amount changes |
| `/scenarios/{goal_id}` | GET | Get simulation history for goal | Review past simulations |
| `/create-test-goal` | POST | Create test goal for simulation | Development testing |
| `/dashboard` | GET | Get simulation analytics dashboard | Performance insights |

### 💬 Chatbot Router (`/chatbot`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/ask` | POST | Chat with AI financial assistant | Get advice on goal planning |

### ⏰ Scheduler Router (`/scheduler`)

| Endpoint | Method | Purpose | Example Use |
|----------|---------|---------|-------------|
| `/status` | GET | Check background scheduler status | System health monitoring |
| `/analyze-goal` | POST | Manually trigger goal analysis | Force check specific goal |
| `/health` | GET | Comprehensive system health check | Verify automation running |

---

## 🚀 Swagger Examples & Testing

### How to Use Swagger UI

1. **Start the server:**
   ```bash
   cd backend/app
   uvicorn main:app --reload
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:8000/docs
   ```

### Complete Test Sequence in Swagger

#### 1. User Registration & Authentication
```http
POST /users/register
Content-Type: application/json

{
  "email": "test@ambag.com",
  "password": "test123",
  "profile": {
    "first_name": "Test",
    "last_name": "User",
    "contact_number": "+639123456789",
    "address": "123 Test St",
    "emergency_contact": "Emergency Contact",
    "emergency_contact_number": "+639987654321"
  },
  "role": {
    "role_type": "manager",
    "permissions": ["create_goals", "approve_goals"],
    "group_id": null
  }
}
```

#### 2. User Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "test@ambag.com",
  "password": "test123"
}
```

#### 3. Create Group
```http
POST /groups/
Content-Type: application/json

{
  "name": "Test Family Group",
  "manager_id": "{user_id_from_step_1}",
  "description": "Testing group for AMBAG"
}
```

#### 4. Create Test Scenario
```http
POST /ai-tools/create-test-scenario
```
**Response:**
```json
{
  "goal_id": "goal_uuid_generated",
  "scenario": "Electric Bill Test Scenario",
  "members": ["Maria Santos", "John Cruz", "Jane Dela Cruz"],
  "progress_percentage": 60,
  "next_steps": [
    "Test smart reminders: POST /ai-tools/smart-reminder",
    "Test agentic action: POST /ai-tools/agentic-action"
  ]
}
```

#### 5. Create Goal with Auto Payment
```http
POST /goal/
Content-Type: application/json

{
  "title": "Test Electric Bill",
  "goal_amount": 5000.0,
  "description": "Test goal with auto payment",
  "creator_role": "manager",
  "creator_name": "Test User",
  "target_date": "2025-08-15",
  "auto_payment_settings": {
    "enabled": true,
    "payment_method": "virtual_balance",
    "require_confirmation": false,
    "auto_complete_threshold": 10000.0,
    "notification_settings": {
      "notify_manager": true,
      "notify_contributors": true,
      "send_receipt": true
    }
  }
}
```

#### 6. Add Contributions
```http
POST /goal/{goal_id}/contribute
Content-Type: application/json

{
  "amount": 2500.0,
  "contributor_name": "Test User 1",
  "payment_method": "gcash",
  "reference_number": "GCH123456"
}

POST /goal/{goal_id}/contribute
Content-Type: application/json

{
  "amount": 2500.0,
  "contributor_name": "Test User 2",
  "payment_method": "gcash",
  "reference_number": "GCH123457"
}
```

#### 7. Test Smart Reminder
```http
POST /ai-tools/smart-reminder
Content-Type: application/json

{
  "group_id": "{goal_id}",
  "reminder_type": "payment_due",
  "urgency": "high",
  "auto_send": true
}
```

#### 8. Check Auto Payment Status
```http
GET /goal/{goal_id}/auto-payment/status
```

#### 9. View Virtual Balances
```http
GET /goal/virtual-balances
```

#### 10. Check AI Notifications
```http
GET /ai-tools/notifications/{goal_id}
```

#### 11. Test Agentic Action
```http
POST /ai-tools/agentic-action?goal_id={goal_id}
```

#### 12. Run What-If Simulation
```http
POST /simulation/what-if-analysis
Content-Type: application/json

{
  "goal_id": "{goal_id}",
  "scenarios": [
    {
      "scenario_type": "add_member",
      "description": "Add new member to reduce individual burden",
      "parameters": {
        "member_name": "Carlos Mendoza",
        "expected_contribution": 1000
      }
    }
  ],
  "advisor_mode": true
}
```

#### 13. Test Chatbot
```http
POST /chatbot/ask
Content-Type: application/json

{
  "message": "Should we create an emergency fund goal?",
  "context": {
    "user_id": "{user_id}",
    "current_goals": ["{goal_id}"],
    "group_performance": "good"
  }
}
```

---

## 🎓 Understanding the System

### How AMBAG Solves Real Problems

#### Problem: "Mahirap mangollect ng pera sa grupo"
**Solution:** AI automatically sends personalized reminders in Taglish, tracks who's paid, escalates when needed, and processes auto payments when goals are complete.

#### Problem: "Hindi alam kung tama ba ang amount"
**Solution:** What-if simulations show different scenarios. AI advises if goals are realistic and suggests adjustments.

#### Problem: "Nakakalimutan ng members mag-contribute"
**Solution:** Agentic system monitors progress, automatically takes appropriate actions, and sends smart reminders.

#### Problem: "Mahirap mag-decide kung mag-adjust ng goal"
**Solution:** Simulation engine shows outcomes of different choices with AI recommendations.

#### Problem: "Hassle mag-transfer ng pera manually"
**Solution:** Bank-free auto payment system handles transfers automatically using virtual balances, GCash, or BPI instructions.

#### Problem: "Walang secure authentication"
**Solution:** Session-based authentication with role-based permissions and secure password handling.

### Key System Intelligence Features

1. **Predictive Reminders:** AI predicts who will be late and sends early reminders
2. **Risk Assessment:** System evaluates if goals are achievable with current participation
3. **Autonomous Actions:** AI makes decisions when immediate action is needed
4. **Cultural Adaptation:** Messages are in Taglish and culturally appropriate
5. **Performance Learning:** System learns from successful groups to help struggling ones
6. **Bank-Free Payments:** No need for traditional banking - uses popular Filipino payment methods
7. **Role-Based Security:** Managers and contributors have appropriate permissions
8. **Real-Time Monitoring:** Background scheduler continuously monitors all goals

### Bank-Free Auto Payment Intelligence

The system intelligently chooses payment methods based on:
- **Goal amount** (virtual balance for smaller amounts)
- **Member preferences** (GCash vs BPI vs manual)
- **Manager approval requirements** (automatic vs manual confirmation)
- **Threshold settings** (auto-complete under certain amounts)

### AI Agentic Workflow

The AI system operates autonomously by:
1. **Monitoring** all goals continuously via background scheduler
2. **Analyzing** progress, deadlines, and member behavior patterns
3. **Deciding** on best actions based on urgency and context
4. **Executing** actions like reminders, manager alerts, or payment processing
5. **Learning** from outcomes to improve future decisions

---

## 📋 Quick Reference Commands

### Complete Development Testing Sequence
```bash
# 1. Start the server
cd backend/app
uvicorn main:app --reload

# 2. Create test users
curl -X POST "http://localhost:8000/users/create-test-users"

# 3. Login test user
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@ambag.com","password":"manager123"}'

# 4. Create test group
curl -X POST "http://localhost:8000/groups/create-test-group"

# 5. Create test scenario
curl -X POST "http://localhost:8000/ai-tools/create-test-scenario"

# 6. Test smart reminder
curl -X POST "http://localhost:8000/ai-tools/smart-reminder" \
  -H "Content-Type: application/json" \
  -d '{"group_id":"[GOAL_ID]","auto_send":true}'

# 7. Check notifications
curl -X GET "http://localhost:8000/ai-tools/notifications/[GOAL_ID]"

# 8. Test agentic action
curl -X POST "http://localhost:8000/ai-tools/agentic-action?goal_id=[GOAL_ID]"

# 9. Test auto payment setup
curl -X POST "http://localhost:8000/goal/[GOAL_ID]/auto-payment/setup" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"payment_method":"virtual_balance","require_confirmation":false}'

# 10. View virtual balances
curl -X GET "http://localhost:8000/goal/virtual-balances"

# 11. Run simulation
curl -X POST "http://localhost:8000/simulation/what-if-analysis" \
  -H "Content-Type: application/json" \
  -d '{"goal_id":"[GOAL_ID]","scenarios":[...]}'

# 12. Test chatbot
curl -X POST "http://localhost:8000/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"message":"Should we create an emergency fund?"}'
```

### Bank-Free Auto Payment Testing
```bash
# 1. Create goal with auto payment
curl -X POST "http://localhost:8000/goal/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Auto Payment",
    "goal_amount": 3000.0,
    "creator_role": "manager",
    "creator_name": "Test Manager",
    "target_date": "2025-08-15",
    "auto_payment_settings": {
      "enabled": true,
      "payment_method": "virtual_balance",
      "auto_complete_threshold": 5000.0,
      "require_confirmation": false
    }
  }'

# 2. Add contributions to reach goal
curl -X POST "http://localhost:8000/goal/[GOAL_ID]/contribute" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1500.0, "contributor_name": "Test User 1"}'

curl -X POST "http://localhost:8000/goal/[GOAL_ID]/contribute" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1500.0, "contributor_name": "Test User 2"}'

# 3. Check auto payment was triggered
curl -X GET "http://localhost:8000/goal/[GOAL_ID]/auto-payment/status"

# 4. View virtual balances
curl -X GET "http://localhost:8000/goal/virtual-balances"

# 5. Check AI notifications for auto payment success
curl -X GET "http://localhost:8000/ai-tools/notifications/[GOAL_ID]"
```

### Production Monitoring
```bash
# Check system health
curl -X GET "http://localhost:8000/scheduler/health"

# Get dashboard summary
curl -X GET "http://localhost:8000/ai-tools/dashboard-summary"

# View all notifications for a group
curl -X GET "http://localhost:8000/ai-tools/notifications/[GROUP_ID]"

# Check auto payment queue
curl -X GET "http://localhost:8000/goal/auto-payment/queue"

# View payment instructions
curl -X GET "http://localhost:8000/goal/payment-instructions"

# Get simulation dashboard
curl -X GET "http://localhost:8000/simulation/dashboard"
```

### User Management Commands
```bash
# Get all users
curl -X GET "http://localhost:8000/users/"

# Get managers only
curl -X GET "http://localhost:8000/users/managers"

# Get contributors only
curl -X GET "http://localhost:8000/users/contributors"

# Get user groups
curl -X GET "http://localhost:8000/groups/user/[USER_ID]"

# Update user profile
curl -X PUT "http://localhost:8000/users/profile/[USER_ID]" \
  -H "Content-Type: application/json" \
  -d '{"profile": {"first_name": "Updated Name"}}'
```

### Group Management Commands
```bash
# Get all groups
curl -X GET "http://localhost:8000/groups/"

# Get group statistics
curl -X GET "http://localhost:8000/groups/[GROUP_ID]/stats"

# Add member to group
curl -X POST "http://localhost:8000/groups/[GROUP_ID]/members" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "[USER_ID]", "role": "contributor"}'

# Update member role
curl -X PUT "http://localhost:8000/groups/[GROUP_ID]/members/[USER_ID]/role" \
  -H "Content-Type: application/json" \
  -d '"manager"'
```

---

This comprehensive documentation covers all features, endpoints, and functionalities of the AMBAG system, including the complete bank-free auto payment system, user authentication, group management, AI-powered automation, and agentic workflows. The system provides a complete solution for Filipino financial collaboration with intelligent automation and culturally appropriate interactions.
