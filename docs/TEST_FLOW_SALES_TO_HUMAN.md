# Test Flow: Sales Agent to Human Transfer

## Setup Requirements

1. **Update Environment Variables**
   ```bash
   DEALERSHIP_PHONE=+1YOUR_PHONE_NUMBER  # Your actual phone for testing
   ```

2. **Update Assistant IDs**
   In `src/routes/vapi-tools-transfer.js`:
   ```javascript
   const ASSISTANT_IDS = {
       leadQualifier: '1506a9d9-a0d5-4439-9d83-f447bcedda1e',
       sales: 'YOUR-SALES-ASSISTANT-ID',  // Get from VAPI dashboard after creating
       // ...
   };
   ```

## Test Scenario: Complete Sales to Human Transfer

### Step 1: Initial Call
Call your Lead Qualifier assistant and say:
> "Hi, I'm interested in buying a new SUV"

**Expected**: Lead Qualifier should transfer you to Sales Agent

### Step 2: Sales Interaction
Once transferred to Sales Agent:
> "Can you show me what SUVs you have under $40,000?"

**Expected**: Sales Agent uses `checkInventory` tool and shows available SUVs

### Step 3: Vehicle Details
> "Tell me more about the Hyundai Santa Fe"

**Expected**: Sales Agent uses `getVehicleDetails` tool

### Step 4: Human Transfer Request
> "I'd like to speak with a sales manager about negotiating the price"

**Expected**: 
- Sales Agent acknowledges the request
- Uses `transferToAgent("human")` 
- VAPI transfers the call to the phone number in DEALERSHIP_PHONE

## Alternative Human Transfer Triggers

1. **Direct Request**
   > "Can I speak to a real person?"

2. **After Vehicle Selection**
   > Sales Agent: "Would you like to speak with our sales manager to discuss pricing and incentives?"
   > Customer: "Yes, please"

3. **Complex Finance Question**
   > "I have a bankruptcy from 2 years ago, can I still get financing?"
   > Sales Agent should offer to transfer to human for complex credit situations

## What Happens During Transfer

1. Sales Agent says: "I'll connect you with one of our team members right away. Please hold for just a moment."
2. VAPI initiates phone transfer to DEALERSHIP_PHONE
3. Context is passed including:
   - Customer's vehicle interests
   - Conversation summary
   - Any preferences mentioned

## Testing Checklist

- [ ] Lead Qualifier successfully transfers to Sales
- [ ] Sales Agent can search inventory
- [ ] Sales Agent can show vehicle details
- [ ] Sales Agent properly handles human transfer request
- [ ] Phone actually rings at DEALERSHIP_PHONE number
- [ ] Context is logged in your database

## Debugging Tips

1. **Check Railway Logs**
   ```bash
   railway logs
   ```

2. **Verify Phone Number Format**
   - Must include country code: +1 for US
   - No spaces or special characters

3. **Common Issues**
   - Wrong assistant ID → Update in vapi-tools-transfer.js
   - Phone not ringing → Check DEALERSHIP_PHONE in .env
   - Transfer failing → Check VAPI webhook logs

## Sample Sales Agent Prompts for Testing

1. **Price Negotiation**
   > "The Santa Fe is nice but $34,900 is above my budget. What's your best price?"

2. **Trade-In**
   > "I have a 2018 Honda Civic to trade in. Can you help with that?"

3. **Financing**
   > "What kind of monthly payments would I be looking at with $5,000 down?"

4. **Test Drive**
   > "Can I test drive the Santa Fe this Saturday?"

Each of these should work with the Sales Agent, and at any point you can request to speak with a human to test the transfer.