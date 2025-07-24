# 🚗 VAPI Squads Setup Guide - Car Dealership

## Overview
This implementation creates a multi-agent system where specialized AI agents handle different aspects of car sales, with seamless transfers and context preservation.

## 🎯 Agent Specializations

### 1. **Lead Qualifier Agent**
- **Role:** Initial customer contact and qualification
- **Responsibilities:**
  - Gather customer information
  - Assess buying intent
  - Determine urgency level
  - Route to appropriate specialist
- **Transfer Conditions:**
  - Qualified leads → Sales Agent
  - High urgency → Manager
  - Browsers → Follow-up Agent

### 2. **Sales Agent**
- **Role:** Primary sales consultation and vehicle presentation
- **Responsibilities:**
  - Show vehicle options
  - Discuss features and benefits
  - Handle objections
  - Guide toward purchase
- **Transfer Conditions:**
  - Test drive requests → Test Drive Coordinator
  - Financing questions → Finance Specialist
  - Escalations → Manager

### 3. **Test Drive Coordinator**
- **Role:** Schedule and coordinate test drives
- **Responsibilities:**
  - Check availability
  - Schedule appointments
  - Confirm details
  - Follow up after test drive
- **Transfer Conditions:**
  - After scheduling → Sales Agent
  - If unavailable → Sales Agent

### 4. **Finance Specialist**
- **Role:** Handle financing and payment options
- **Responsibilities:**
  - Discuss loan options
  - Calculate payments
  - Process applications
  - Explain terms
- **Transfer Conditions:**
  - Approved → Sales Agent
  - Declined → Manager

### 5. **Sales Manager**
- **Role:** Handle escalated situations and special requests
- **Responsibilities:**
  - Resolve complaints
  - Approve special deals
  - Handle VIP customers
  - Override policies
- **Transfer Conditions:**
  - Resolved → Sales Agent
  - Follow-up needed → Follow-up Agent

### 6. **Follow-up Agent**
- **Role:** Maintain relationships and re-engage prospects
- **Responsibilities:**
  - Follow up with prospects
  - Send information
  - Re-engage cold leads
  - Maintain relationships
- **Transfer Conditions:**
  - Interested → Sales Agent
  - Not interested → End call

## 🔧 Implementation Steps

### Step 1: Create VAPI Assistants

Create 6 separate assistants in your VAPI dashboard:

#### Assistant 1: Lead Qualifier
```json
{
  "name": "Lead Qualifier",
  "model": "gpt-4",
  "systemPrompt": "You are a friendly lead qualification specialist at a car dealership. Your role is to gather basic information about customers and determine their buying intent. Be warm, professional, and efficient. Ask about their vehicle needs, budget, timeline, and urgency level.",
  "functions": [
    "leadQualification",
    "transferAgent"
  ],
  "webhookUrl": "https://vapi-dealership-demo-production.up.railway.app/squads/webhook"
}
```

#### Assistant 2: Sales Agent
```json
{
  "name": "Sales Agent",
  "model": "gpt-4",
  "systemPrompt": "You are an experienced car sales professional. You help qualified customers find the perfect vehicle, discuss features, handle objections, and guide them toward purchase. Be knowledgeable about vehicles, competitive, and focused on closing sales.",
  "functions": [
    "salesConsultation",
    "checkInventory",
    "transferAgent"
  ],
  "webhookUrl": "https://vapi-dealership-demo-production.up.railway.app/squads/webhook"
}
```

#### Assistant 3: Test Drive Coordinator
```json
{
  "name": "Test Drive Coordinator",
  "model": "gpt-4",
  "systemPrompt": "You coordinate test drives for customers. You check availability, schedule appointments, confirm details, and ensure a smooth test drive experience. Be organized, friendly, and detail-oriented.",
  "functions": [
    "testDriveScheduling",
    "transferAgent"
  ],
  "webhookUrl": "https://vapi-dealership-demo-production.up.railway.app/squads/webhook"
}
```

#### Assistant 4: Finance Specialist
```json
{
  "name": "Finance Specialist",
  "model": "gpt-4",
  "systemPrompt": "You handle all financing and payment options for customers. You discuss loans, calculate payments, explain terms, and help customers find the best financing solution. Be knowledgeable about financial products and regulations.",
  "functions": [
    "financeConsultation",
    "transferAgent"
  ],
  "webhookUrl": "https://vapi-dealership-demo-production.up.railway.app/squads/webhook"
}
```

#### Assistant 5: Sales Manager
```json
{
  "name": "Sales Manager",
  "model": "gpt-4",
  "systemPrompt": "You are the sales manager who handles escalated situations, special requests, and VIP customers. You have authority to approve special deals and resolve complex issues. Be authoritative, solution-oriented, and customer-focused.",
  "functions": [
    "transferAgent"
  ],
  "webhookUrl": "https://vapi-dealership-demo-production.up.railway.app/squads/webhook"
}
```

#### Assistant 6: Follow-up Agent
```json
{
  "name": "Follow-up Agent",
  "model": "gpt-4",
  "systemPrompt": "You follow up with prospects and maintain customer relationships. You re-engage cold leads, send information, and keep customers informed about new vehicles and offers. Be persistent but not pushy.",
  "functions": [
    "transferAgent"
  ],
  "webhookUrl": "https://vapi-dealership-demo-production.up.railway.app/squads/webhook"
}
```

### Step 2: Configure Squad Settings

In your VAPI dashboard, create a Squad with these settings:

```json
{
  "name": "Car Dealership Squad",
  "assistants": [
    "lead-qualifier-assistant-id",
    "sales-agent-assistant-id", 
    "test-drive-coordinator-assistant-id",
    "finance-specialist-assistant-id",
    "sales-manager-assistant-id",
    "follow-up-agent-assistant-id"
  ],
  "defaultAssistant": "lead-qualifier-assistant-id",
  "transferConditions": {
    "leadQualifier": {
      "qualified": "sales-agent-assistant-id",
      "urgent": "sales-manager-assistant-id",
      "browse": "follow-up-agent-assistant-id"
    },
    "salesAgent": {
      "testDrive": "test-drive-coordinator-assistant-id",
      "financing": "finance-specialist-assistant-id",
      "escalate": "sales-manager-assistant-id"
    }
  }
}
```

### Step 3: Configure Background Sounds

Add these background sound URLs to your VAPI configuration:

```json
{
  "backgroundSounds": {
    "office": "https://your-domain.com/office-ambience.mp3",
    "showroom": "https://your-domain.com/showroom-ambience.mp3", 
    "testDrive": "https://your-domain.com/road-ambience.mp3"
  }
}
```

### Step 4: Voice Configuration

Configure each assistant with appropriate voice settings:

```json
{
  "voice": {
    "provider": "elevenlabs",
    "voiceId": "appropriate-voice-id",
    "backgroundSound": "office",
    "backchanneling": true,
    "fillerInjection": true,
    "emotionDetection": true
  }
}
```

## 🚀 API Endpoints

### Squad Configuration
```bash
GET https://vapi-dealership-demo-production.up.railway.app/squads/config
```

### Squad Webhook
```bash
POST https://vapi-dealership-demo-production.up.railway.app/squads/webhook
```

### Transfer Function
```bash
POST https://vapi-dealership-demo-production.up.railway.app/squads/function/transferAgent
```

## 📊 Monitoring and Analytics

The system tracks:
- Transfer history between agents
- Conversation context preservation
- Agent performance metrics
- Customer journey mapping
- Resolution rates by agent type

## 🔄 Transfer Logic

The system automatically determines the next agent based on:
- Customer intent (buy, browse, test drive, finance)
- Urgency level (high, medium, low)
- Customer type (qualified, prospect, VIP)
- Conversation stage (initial, consultation, closing)

## 🎯 Best Practices

1. **Context Preservation:** All conversation history is maintained during transfers
2. **Seamless Handoffs:** Transfers feel natural and professional
3. **Specialized Expertise:** Each agent focuses on their core competency
4. **Escalation Paths:** Clear escalation routes for complex situations
5. **Background Ambiance:** Realistic office/showroom sounds enhance experience

## 🧪 Testing

Test the squad system with these scenarios:

1. **New Customer Journey:**
   - Lead Qualifier → Sales Agent → Test Drive Coordinator → Sales Agent

2. **Financing Focus:**
   - Lead Qualifier → Sales Agent → Finance Specialist → Sales Agent

3. **Escalation Scenario:**
   - Lead Qualifier → Sales Agent → Manager → Sales Agent

4. **Follow-up Scenario:**
   - Lead Qualifier → Follow-up Agent → Sales Agent

## 📈 Expected Outcomes

- **Improved Customer Experience:** Specialized agents provide better service
- **Higher Conversion Rates:** Expert handling of each sales stage
- **Better Lead Qualification:** More accurate routing and qualification
- **Reduced Escalations:** Specialized agents handle more situations
- **Enhanced Realism:** Background sounds and natural conversation flow 