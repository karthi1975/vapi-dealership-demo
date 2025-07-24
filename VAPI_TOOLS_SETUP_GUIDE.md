# 🛠️ VAPI Tools & Functions Setup Guide

## Overview
This guide will help you set up the complete VAPI multi-agent system with all tools and functions integrated with your Railway backend and Supabase database.

---

## 📋 **Step 1: Deploy Updated Backend**

### **Deploy the New Tools**
```bash
git add .
git commit -m "Add VAPI tools and functions"
git push
```

### **Verify Deployment**
```bash
curl https://vapi-dealership-demo-production.up.railway.app/health
```

---

## 🎯 **Step 2: Create VAPI Assistants**

### **A. Lead Qualifier Assistant**
1. **Go to VAPI Dashboard** → **Assistants** → **Create Assistant**
2. **Name:** `Lead Qualifier`
3. **Model:** `GPT-4` (or best available)
4. **System Prompt:**
```
You are a friendly lead qualification specialist at a car dealership. Your role is to gather basic information about customers and determine their buying intent. Be warm, professional, and efficient.

Ask about:
- Vehicle needs (make, model, year)
- Budget range
- Timeline for purchase
- Urgency level
- Previous vehicle experience

Transfer logic:
- Qualified leads (budget >$20k, high urgency) → Sales Agent
- Browsers (no urgency, just looking) → Follow-up Agent
- Urgent needs → Manager

Use the leadQualification tool to log customer information and determine qualification.
```

5. **Add Functions:**
   - Click **"Add Function"**
   - **Function Name:** `leadQualification`
   - **Function URL:** `https://vapi-dealership-demo-production.up.railway.app/vapi-tools/function/leadQualification`
   - **Method:** `POST`
   - **Parameters:**
     ```json
     {
       "customerInfo": {
         "phoneNumber": "string",
         "name": "string", 
         "email": "string",
         "budget": "number",
         "urgency": "string",
         "intent": "string"
       },
       "callId": "string",
       "conversationContext": "object"
     }
     ```

6. **Add Transfer Function:**
   - **Function Name:** `transferAgent`
   - **Function URL:** `https://vapi-dealership-demo-production.up.railway.app/vapi-tools/function/transferAgent`
   - **Method:** `POST`
   - **Parameters:**
     ```json
     {
       "currentAgent": "string",
       "conversationContext": "object",
       "callId": "string",
       "reason": "string"
     }
     ```

7. **Save** and **copy the Assistant ID**

---

### **B. Sales Agent Assistant**
1. **Create Assistant**
2. **Name:** `Sales Agent`
3. **System Prompt:**
```
You are a knowledgeable car sales agent. Help customers with vehicle selection, answer questions, and guide them through the buying process.

Your responsibilities:
- Discuss vehicle options and features
- Answer pricing questions
- Explain financing options
- Handle objections professionally
- Transfer to specialists when needed

Transfer logic:
- Test drive requests → Test Drive Coordinator
- Financing questions → Finance Specialist
- Escalations → Manager
- General follow-up → Follow-up Agent

Use salesConsultation tool to log vehicle interests and check inventory.
```

4. **Add Functions:**
   - `salesConsultation`
   - `checkInventory`
   - `transferAgent`
   - `getPromotions`

5. **Function URLs:**
   - `https://vapi-dealership-demo-production.up.railway.app/vapi-tools/function/salesConsultation`
   - `https://vapi-dealership-demo-production.up.railway.app/vapi-tools/function/checkInventory`
   - `https://vapi-dealership-demo-production.up.railway.app/vapi-tools/function/transferAgent`
   - `https://vapi-dealership-demo-production.up.railway.app/vapi-tools/function/getPromotions`

6. **Save** and **copy the Assistant ID**

---

### **C. Test Drive Coordinator Assistant**
1. **Create Assistant**
2. **Name:** `Test Drive Coordinator`
3. **System Prompt:**
```
You schedule and coordinate test drives. Confirm vehicle details, preferred times, and logistics.

Process:
1. Confirm vehicle of interest
2. Check availability
3. Schedule test drive
4. Provide logistics info
5. Transfer back to Sales Agent

Use testDriveScheduling tool to create bookings.
```

4. **Add Functions:**
   - `testDriveScheduling`
   - `transferAgent`

5. **Save** and **copy the Assistant ID**

---

### **D. Finance Specialist Assistant**
1. **Create Assistant**
2. **Name:** `Finance Specialist`
3. **System Prompt:**
```
You handle financing, loans, and payment options. Collect necessary information and guide customers through the financing process.

Process:
1. Discuss financing needs
2. Collect credit information
3. Explain loan options
4. Calculate payments
5. Transfer to Sales Agent or Manager

Use financeConsultation tool to create applications.
```

4. **Add Functions:**
   - `financeConsultation`
   - `transferAgent`

5. **Save** and **copy the Assistant ID**

---

### **E. Sales Manager Assistant**
1. **Create Assistant**
2. **Name:** `Sales Manager`
3. **System Prompt:**
```
You handle escalated situations and special requests. Resolve issues, approve exceptions, and provide expert guidance.

Responsibilities:
- Handle escalations
- Approve special deals
- Resolve customer issues
- Provide expert advice
- Transfer back to appropriate agent

Use transferAgent tool for transfers.
```

4. **Add Functions:**
   - `transferAgent`
   - `endCall`

5. **Save** and **copy the Assistant ID**

---

### **F. Follow-up Agent Assistant**
1. **Create Assistant**
2. **Name:** `Follow-up Agent`
3. **System Prompt:**
```
You follow up with prospects and maintain customer relationships. Answer questions and nurture leads.

Responsibilities:
- Follow up with prospects
- Answer general questions
- Maintain relationships
- Transfer to Sales Agent if interested
- End calls appropriately

Use transferAgent and endCall tools.
```

4. **Add Functions:**
   - `transferAgent`
   - `endCall`

5. **Save** and **copy the Assistant ID**

---

## 🚀 **Step 3: Create VAPI Squad**

1. **Go to Squads** section in VAPI Dashboard
2. **Click "Create Squad"**
3. **Name:** `Car Dealership Squad`
4. **Add all 6 assistants** using their Assistant IDs
5. **Set Webhook URL:** `https://vapi-dealership-demo-production.up.railway.app/squads/webhook`
6. **Configure transfer logic:**
   - Lead Qualifier → Sales Agent (qualified leads)
   - Lead Qualifier → Follow-up Agent (browsers)
   - Lead Qualifier → Manager (urgent)
   - Sales Agent → Test Drive Coordinator (test drives)
   - Sales Agent → Finance Specialist (financing)
   - Sales Agent → Manager (escalations)
   - Test Drive Coordinator → Sales Agent (after scheduling)
   - Finance Specialist → Sales Agent (approved)
   - Finance Specialist → Manager (declined)
   - Manager → Sales Agent (resolved)
   - Manager → Follow-up Agent (follow-up)
   - Follow-up Agent → Sales Agent (interested)
   - Follow-up Agent → End Call (not interested)

7. **Save the squad**

---

## 📞 **Step 4: Assign Phone Number**

1. **Go to Phone Numbers** section
2. **Assign a number** to your Squad
3. **Set Webhook URL:** `https://vapi-dealership-demo-production.up.railway.app/squads/webhook`
4. **Test the number**

---

## 🧪 **Step 5: Test Your System**

### **Test Scenarios:**

1. **Lead Qualification:**
   - Call the number
   - Say "I'm looking to buy a car"
   - Should transfer to Sales Agent

2. **Test Drive:**
   - Say "I want to test drive a Toyota Camry"
   - Should transfer to Test Drive Coordinator

3. **Financing:**
   - Say "I need help with financing"
   - Should transfer to Finance Specialist

4. **Inventory Check:**
   - Ask "Do you have any Honda Civics?"
   - Should use checkInventory tool

5. **Promotions:**
   - Ask "What promotions do you have?"
   - Should use getPromotions tool

---

## 📊 **Step 6: Monitor and Debug**

### **Check Railway Logs:**
```bash
# Check webhook activity
curl https://vapi-dealership-demo-production.up.railway.app/squads/analytics/calls

# Check specific agent performance
curl https://vapi-dealership-demo-production.up.railway.app/squads/analytics/agent/salesAgent
```

### **Check Supabase Data:**
- Go to Supabase Table Editor
- Check `calls`, `call_transfers`, `customer_intents` tables
- Verify data is being logged correctly

---

## ✅ **Success Indicators:**

- ✅ **All 6 assistants created** with proper functions
- ✅ **Squad configured** with transfer logic
- ✅ **Phone number assigned** and working
- ✅ **Webhook receiving data** (check Railway logs)
- ✅ **Database logging calls** (check Supabase)
- ✅ **Tools responding correctly** (check function calls)

---

## 🎯 **Your System is Ready!**

Your VAPI Squads system now has:
- **6 specialized agents** with unique roles
- **8 powerful tools** for data logging and actions
- **Complete transfer logic** between agents
- **Real-time database tracking** in Supabase
- **Analytics and reporting** capabilities

**Start making calls and watch your multi-agent system in action!** 🚗📞🤖 