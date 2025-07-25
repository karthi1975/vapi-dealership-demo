# Sales Agent VAPI Assistant Setup Instructions

## Step 1: Create New Assistant in VAPI

1. Go to VAPI Dashboard → Assistants → Create New Assistant
2. Name: "Sales Agent - [Your Dealership Name]"
3. Model: GPT-4 or GPT-3.5-turbo

## Step 2: Configure System Prompt

Copy and paste this entire system prompt:

```
You are a professional automotive sales specialist at [Dealership Name]. Your role is to help customers find the perfect vehicle based on their needs, preferences, and budget.

## Your Capabilities:
- Access to real-time inventory with detailed vehicle information
- Schedule test drives
- Provide financing estimates
- Answer questions about features, warranties, and pricing
- Transfer to appropriate departments when needed

## Conversation Guidelines:
1. Be consultative, not pushy
2. Focus on understanding customer needs first
3. Provide honest, transparent information
4. Use the customer's name when provided
5. Highlight vehicle features that match their needs
6. Always confirm availability before making promises

## Tools Available:
- checkInventory: Search available vehicles
- getVehicleDetails: Get detailed specs and pricing
- scheduleTestDrive: Book test drives
- calculatePayment: Provide financing estimates
- transferToAgent: Transfer to other departments

## Transfer Scenarios:
- Service questions → transferToAgent("service", context)
- Financing details → transferToAgent("finance", context)
- Parts inquiries → transferToAgent("parts", context)
- Complex situations → transferToAgent("human", context)
- Customer requests human → transferToAgent("human", context)
- After showing vehicles → Ask if they want to speak with sales manager → transferToAgent("human", context)

## Important Transfer Instructions:
When transferring, ALWAYS include context with:
- currentAgent: "sales"
- customerInfo: {name, phone, preferences}
- intent: reason for transfer
- summary: brief conversation summary

Remember: Your goal is to provide exceptional service and help customers make informed decisions.
```

## Step 3: Configure First Message

```
Hi! I'm [Agent Name], a sales specialist here at [Dealership Name]. I understand you're interested in finding a vehicle. I'd be happy to help you explore our inventory and find the perfect match for your needs. 

What type of vehicle are you looking for today?
```

## Step 4: Add Tools

### Tool 1: checkInventory
**URL:** `https://vapi-dealership-railway-production.up.railway.app/vapi-tools`

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "vehicleType": {
      "type": "string",
      "description": "Type of vehicle (sedan, suv, truck, van, coupe, convertible)"
    },
    "make": {
      "type": "string",
      "description": "Vehicle manufacturer (Toyota, Honda, Ford, etc.)"
    },
    "model": {
      "type": "string",
      "description": "Specific model name"
    },
    "yearRange": {
      "type": "object",
      "properties": {
        "min": {
          "type": "number",
          "description": "Minimum year"
        },
        "max": {
          "type": "number",
          "description": "Maximum year"
        }
      },
      "description": "Year range for the vehicle"
    },
    "priceRange": {
      "type": "object",
      "properties": {
        "min": {
          "type": "number",
          "description": "Minimum price"
        },
        "max": {
          "type": "number",
          "description": "Maximum price"
        }
      },
      "description": "Price range in dollars"
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Desired features (leather, sunroof, awd, etc.)"
    }
  },
  "required": []
}
```

### Tool 2: getVehicleDetails
**URL:** `https://vapi-dealership-railway-production.up.railway.app/vapi-tools`

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "vehicleId": {
      "type": "string",
      "description": "The vehicle's inventory ID or VIN"
    }
  },
  "required": ["vehicleId"]
}
```

### Tool 3: scheduleTestDrive
**URL:** `https://vapi-dealership-railway-production.up.railway.app/vapi-tools`

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "vehicleId": {
      "type": "string",
      "description": "The vehicle to test drive"
    },
    "customerName": {
      "type": "string",
      "description": "Customer's full name"
    },
    "customerPhone": {
      "type": "string",
      "description": "Customer's phone number"
    },
    "preferredDate": {
      "type": "string",
      "description": "Preferred date for test drive"
    },
    "preferredTime": {
      "type": "string",
      "description": "Preferred time slot"
    }
  },
  "required": ["vehicleId", "customerName", "customerPhone", "preferredDate"]
}
```

### Tool 4: calculatePayment
**URL:** `https://vapi-dealership-railway-production.up.railway.app/vapi-tools`

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "vehiclePrice": {
      "type": "number",
      "description": "Vehicle price"
    },
    "downPayment": {
      "type": "number",
      "description": "Down payment amount"
    },
    "tradeInValue": {
      "type": "number",
      "description": "Trade-in value if applicable"
    },
    "loanTerm": {
      "type": "number",
      "description": "Loan term in months (36, 48, 60, 72)"
    },
    "creditScore": {
      "type": "string",
      "description": "Credit score range (excellent, good, fair, poor)"
    }
  },
  "required": ["vehiclePrice", "loanTerm"]
}
```

### Tool 5: transferToAgent
**URL:** `https://vapi-dealership-railway-production.up.railway.app/vapi-tools`

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "targetAgent": {
      "type": "string",
      "enum": ["service", "finance", "parts", "human", "leadQualifier"],
      "description": "The department or agent to transfer to"
    },
    "context": {
      "type": "object",
      "properties": {
        "currentAgent": {
          "type": "string",
          "description": "Current agent (should be 'sales')"
        },
        "customerInfo": {
          "type": "object",
          "description": "Customer information including name, phone, and preferences"
        },
        "intent": {
          "type": "string",
          "description": "Reason for transfer"
        },
        "summary": {
          "type": "string",
          "description": "Brief summary of conversation so far"
        }
      },
      "required": ["currentAgent", "intent", "summary"]
    }
  },
  "required": ["targetAgent", "context"]
}
```

## Step 5: Configure Voice Settings

1. Voice: Choose a professional, friendly voice
2. Voice Speed: 1.0
3. Voice Stability: 0.9
4. Voice Similarity: 0.8

## Step 6: Advanced Settings

1. **End Call Functions:** Enable
2. **Max Duration:** 1800 seconds (30 minutes)
3. **Idle Timeout:** 10 seconds
4. **Interruption Sensitivity:** 0.7

## Step 7: Save and Get Assistant ID

1. Click "Save Assistant"
2. Copy the Assistant ID from the dashboard
3. Update your code in `src/routes/vapi-tools-transfer.js`:
   ```javascript
   const ASSISTANT_IDS = {
       leadQualifier: '1506a9d9-a0d5-4439-9d83-f447bcedda1e',
       sales: 'YOUR-ASSISTANT-ID-HERE', // <-- Paste here
       // ...
   };
   ```

## Step 8: Test Your Sales Agent

### Test Conversation Flow:
1. **Inventory Search:**
   - "I'm looking for an SUV under $40,000"
   - "Show me Honda vehicles"
   - "What trucks do you have?"

2. **Vehicle Details:**
   - "Tell me more about the Santa Fe"
   - "What features does the F-150 have?"

3. **Test Drive:**
   - "I'd like to test drive the Accord this Saturday"
   - "Can I schedule a test drive?"

4. **Payment Calculation:**
   - "What would my monthly payment be?"
   - "I have $5,000 down, what's my payment?"

5. **Human Transfer:**
   - "I'd like to speak with a manager about pricing"
   - "Can I talk to a real person?"
   - "I have some complex financing questions"

### Expected Behavior:
- Sales agent should use tools naturally in conversation
- When transferring to human, your phone (+18016809129) should ring
- Context should be preserved across transfers

## Troubleshooting

1. **Tools not working:** Check Railway logs with `railway logs`
2. **Transfer failing:** Verify assistant IDs are correct
3. **Phone not ringing:** Ensure DEALERSHIP_PHONE is set in .env
4. **Context not passing:** Check that context object is properly formatted

## Important Notes

- The human transfer will call +18016809129 (your configured phone)
- All tool calls go to your Railway deployment URL
- Context is critical for smooth transfers - always include it
- Test each tool individually before testing transfers