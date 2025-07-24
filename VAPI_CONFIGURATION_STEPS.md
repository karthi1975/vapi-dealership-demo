# 🚗 VAPI Configuration Steps - Car Dealership Squads

## ✅ **Prerequisites Completed:**
- ✅ Railway app deployed: `https://vapi-dealership-demo-production.up.railway.app`
- ✅ All environment variables configured
- ✅ Squad endpoints working
- ✅ Transfer functions implemented

---

## 📋 **Step-by-Step VAPI Configuration**

### **Step 1: Access VAPI Dashboard**
1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Sign in to your account
3. Navigate to "Assistants" section

---

### **Step 2: Create Lead Qualifier Assistant**

1. **Click "Create Assistant"**
2. **Fill in these details:**
   ```
   Name: Lead Qualifier
   Model: GPT-4
   System Prompt: You are a friendly lead qualification specialist at a car dealership. Your role is to gather basic information about customers and determine their buying intent. Be warm, professional, and efficient. Ask about their vehicle needs, budget, timeline, and urgency level. If they seem qualified and ready to buy, transfer to Sales Agent. If they're just browsing, transfer to Follow-up Agent. If they have urgent needs, transfer to Manager.
   ```
3. **Add Functions:**
   - Click "Add Function"
   - Function Name: `leadQualification`
   - Function Name: `transferAgent`
4. **Set Webhook URL:**
   ```
   https://vapi-dealership-demo-production.up.railway.app/squads/webhook
   ```
5. **Save the assistant**
6. **Copy the Assistant ID** (you'll need this for the Squad)

---

### **Step 3: Create Sales Agent Assistant**

1. **Click "Create Assistant"**
2. **Fill in these details:**
   ```
   Name: Sales Agent
   Model: GPT-4
   System Prompt: You are an experienced car sales professional. You help qualified customers find the perfect vehicle, discuss features, handle objections, and guide them toward purchase. Be knowledgeable about vehicles, competitive, and focused on closing sales. If they want a test drive, transfer to Test Drive Coordinator. If they have financing questions, transfer to Finance Specialist. If they need escalation, transfer to Manager.
   ```
3. **Add Functions:**
   - Function Name: `salesConsultation`
   - Function Name: `checkInventory`
   - Function Name: `transferAgent`
4. **Set Webhook URL:**
   ```
   https://vapi-dealership-demo-production.up.railway.app/squads/webhook
   ```
5. **Save and copy Assistant ID**

---

### **Step 4: Create Test Drive Coordinator Assistant**

1. **Click "Create Assistant"**
2. **Fill in these details:**
   ```
   Name: Test Drive Coordinator
   Model: GPT-4
   System Prompt: You coordinate test drives for customers. You check availability, schedule appointments, confirm details, and ensure a smooth test drive experience. Be organized, friendly, and detail-oriented. After scheduling, transfer back to Sales Agent.
   ```
3. **Add Functions:**
   - Function Name: `testDriveScheduling`
   - Function Name: `transferAgent`
4. **Set Webhook URL:**
   ```
   https://vapi-dealership-demo-production.up.railway.app/squads/webhook
   ```
5. **Save and copy Assistant ID**

---

### **Step 5: Create Finance Specialist Assistant**

1. **Click "Create Assistant"**
2. **Fill in these details:**
   ```
   Name: Finance Specialist
   Model: GPT-4
   System Prompt: You handle all financing and payment options for customers. You discuss loans, calculate payments, explain terms, and help customers find the best financing solution. Be knowledgeable about financial products and regulations. If approved, transfer to Sales Agent. If declined, transfer to Manager.
   ```
3. **Add Functions:**
   - Function Name: `financeConsultation`
   - Function Name: `transferAgent`
4. **Set Webhook URL:**
   ```
   https://vapi-dealership-demo-production.up.railway.app/squads/webhook
   ```
5. **Save and copy Assistant ID**

---

### **Step 6: Create Sales Manager Assistant**

1. **Click "Create Assistant"**
2. **Fill in these details:**
   ```
   Name: Sales Manager
   Model: GPT-4
   System Prompt: You are the sales manager who handles escalated situations, special requests, and VIP customers. You have authority to approve special deals and resolve complex issues. Be authoritative, solution-oriented, and customer-focused. If resolved, transfer to Sales Agent. If follow-up needed, transfer to Follow-up Agent.
   ```
3. **Add Functions:**
   - Function Name: `transferAgent`
4. **Set Webhook URL:**
   ```
   https://vapi-dealership-demo-production.up.railway.app/squads/webhook
   ```
5. **Save and copy Assistant ID**

---

### **Step 7: Create Follow-up Agent Assistant**

1. **Click "Create Assistant"**
2. **Fill in these details:**
   ```
   Name: Follow-up Agent
   Model: GPT-4
   System Prompt: You follow up with prospects and maintain customer relationships. You re-engage cold leads, send information, and keep customers informed about new vehicles and offers. Be persistent but not pushy. If they become interested, transfer to Sales Agent. If not interested, end the call.
   ```
3. **Add Functions:**
   - Function Name: `transferAgent`
4. **Set Webhook URL:**
   ```
   https://vapi-dealership-demo-production.up.railway.app/squads/webhook
   ```
5. **Save and copy Assistant ID**

---

### **Step 8: Create the Squad**

1. **Navigate to "Squads" section**
2. **Click "Create Squad"**
3. **Fill in Squad details:**
   ```
   Name: Car Dealership Squad
   Description: Multi-agent system for car sales with specialized roles
   ```
4. **Add Assistants to Squad:**
   - Lead Qualifier (set as default)
   - Sales Agent
   - Test Drive Coordinator
   - Finance Specialist
   - Sales Manager
   - Follow-up Agent
5. **Configure Transfer Conditions:**
   ```
   Lead Qualifier:
   - qualified → Sales Agent
   - urgent → Sales Manager
   - browse → Follow-up Agent
   
   Sales Agent:
   - testDrive → Test Drive Coordinator
   - financing → Finance Specialist
   - escalate → Sales Manager
   
   Test Drive Coordinator:
   - scheduled → Sales Agent
   
   Finance Specialist:
   - approved → Sales Agent
   - declined → Sales Manager
   
   Sales Manager:
   - resolved → Sales Agent
   - followUp → Follow-up Agent
   
   Follow-up Agent:
   - interested → Sales Agent
   ```

---

### **Step 9: Configure Voice Settings**

For each assistant, configure voice settings:

1. **Go to each assistant's settings**
2. **Set Voice Configuration:**
   ```
   Provider: ElevenLabs
   Voice ID: Choose appropriate voice
   Background Sound: office
   Backchanneling: Enabled
   Filler Injection: Enabled
   Emotion Detection: Enabled
   ```

---

### **Step 10: Configure Phone Number**

1. **Go to "Phone Numbers" section**
2. **Select your phone number:** `+14754228650`
3. **Assign the Squad to this number**
4. **Set Squad as the default assistant**

---

### **Step 11: Test the System**

1. **Make a test call** to your phone number
2. **Test different scenarios:**
   - Say "I'm looking to buy a car" → Should transfer to Sales Agent
   - Say "I want a test drive" → Should transfer to Test Drive Coordinator
   - Say "I need financing" → Should transfer to Finance Specialist
   - Say "I want to speak to a manager" → Should transfer to Sales Manager

---

### **Step 12: Monitor and Verify**

1. **Check Railway logs** for webhook events
2. **Verify transfer history** in the logs
3. **Test all transfer scenarios**
4. **Monitor call quality and agent performance**

---

## 🎯 **Expected Results:**

✅ **Seamless transfers** between agents  
✅ **Context preservation** throughout the call  
✅ **Specialized responses** from each agent  
✅ **Background ambiance** for realism  
✅ **Natural conversation flow** with fillers and backchanneling  

---

## 🔧 **Troubleshooting:**

If transfers aren't working:
1. Check webhook URL is correct
2. Verify all assistant IDs are in the squad
3. Test individual assistants first
4. Check Railway logs for errors

---

## 📞 **Your Live System:**

**Domain:** `https://vapi-dealership-demo-production.up.railway.app`  
**Phone Number:** `+14754228650`  
**Squad:** Car Dealership Squad  
**Status:** Ready for production calls  

Your multi-agent car dealership system is now fully configured and ready to handle complex sales scenarios! 🚗📞 