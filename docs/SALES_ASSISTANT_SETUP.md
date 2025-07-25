# Sales Assistant Setup Guide for VAPI

## 1. Create Sales Assistant in VAPI Dashboard

### Assistant Configuration:

**Name:** Sales Agent - [Your Dealership Name]

**First Message:**
```
Hi! I'm [Agent Name], a sales specialist here at [Dealership Name]. I understand you're interested in finding a vehicle. I'd be happy to help you explore our inventory and find the perfect match for your needs. 

What type of vehicle are you looking for today?
```

**System Prompt:**
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
- checkTradeInValue: Estimate trade-in values
- transferToAgent: Transfer to other departments

## Transfer Scenarios:
- Service questions → transferToAgent("service")
- Financing details → transferToAgent("finance")
- Parts inquiries → transferToAgent("parts")
- Complex situations → transferToAgent("human")
- Customer requests human → transferToAgent("human")
- After showing vehicles → Ask if they want to speak with sales manager → transferToAgent("human")

Remember: Your goal is to provide exceptional service and help customers make informed decisions.
```

**Model:** GPT-4 or GPT-3.5-turbo
**Voice:** Choose a professional, friendly voice
**End Call Functions:** Enabled

## 2. Configure Tools in VAPI

### Tool 1: checkInventory
```json
{
  "name": "checkInventory",
  "description": "Search available vehicles in inventory based on customer preferences",
  "parameters": {
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
          "min": {"type": "number"},
          "max": {"type": "number"}
        }
      },
      "priceRange": {
        "type": "object",
        "properties": {
          "min": {"type": "number"},
          "max": {"type": "number"}
        }
      },
      "features": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Desired features (leather, sunroof, awd, etc.)"
      }
    },
    "required": ["vehicleType"]
  },
  "url": "https://your-railway-app.up.railway.app/vapi-tools"
}
```

### Tool 2: getVehicleDetails
```json
{
  "name": "getVehicleDetails",
  "description": "Get detailed information about a specific vehicle",
  "parameters": {
    "type": "object",
    "properties": {
      "vehicleId": {
        "type": "string",
        "description": "The vehicle's inventory ID or VIN"
      }
    },
    "required": ["vehicleId"]
  },
  "url": "https://your-railway-app.up.railway.app/vapi-tools"
}
```

### Tool 3: scheduleTestDrive
```json
{
  "name": "scheduleTestDrive",
  "description": "Schedule a test drive appointment for a customer",
  "parameters": {
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
  },
  "url": "https://your-railway-app.up.railway.app/vapi-tools"
}
```

### Tool 4: calculatePayment
```json
{
  "name": "calculatePayment",
  "description": "Calculate estimated monthly payments for a vehicle",
  "parameters": {
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
  },
  "url": "https://your-railway-app.up.railway.app/vapi-tools"
}
```

### Tool 5: transferToAgent
```json
{
  "name": "transferToAgent",
  "description": "Transfer the call to another department or agent",
  "parameters": {
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
          "currentAgent": {"type": "string"},
          "customerInfo": {"type": "object"},
          "intent": {"type": "string"},
          "summary": {"type": "string"}
        }
      }
    },
    "required": ["targetAgent", "context"]
  },
  "url": "https://your-railway-app.up.railway.app/vapi-tools"
}
```

## 3. Testing the Sales Assistant

### Test Scenario 1: Basic Inventory Search
```
Customer: "I'm looking for a reliable SUV under $35,000"
Expected: Sales agent uses checkInventory tool with vehicleType="suv" and priceRange.max=35000
```

### Test Scenario 2: Specific Vehicle Inquiry
```
Customer: "Do you have any Toyota Highlanders in stock?"
Expected: Sales agent uses checkInventory with make="Toyota" and model="Highlander"
```

### Test Scenario 3: Test Drive Scheduling
```
Customer: "I'd like to test drive that Highlander this Saturday"
Expected: Sales agent uses scheduleTestDrive tool with appropriate parameters
```

### Test Scenario 4: Payment Calculation
```
Customer: "What would my monthly payment be with $5,000 down?"
Expected: Sales agent uses calculatePayment tool
```

### Test Scenario 5: Department Transfer
```
Customer: "I need to schedule an oil change for my current car"
Expected: Sales agent recognizes service need and uses transferToAgent("service")
```

## 4. Update Your Code

After creating the Sales Assistant in VAPI, update the assistant ID in your code:

```javascript
// In src/routes/vapi-tools-transfer.js
const ASSISTANT_IDS = {
    leadQualifier: '1506a9d9-a0d5-4439-9d83-f447bcedda1e',
    sales: 'YOUR-NEW-SALES-ASSISTANT-ID', // Update this!
    // ... other assistants
};
```

## 5. Environment Variables

Add to your `.env` file:
```
VAPI_SALES_AGENT_ID=your-sales-assistant-id
```

## 6. Test the Complete Flow

1. Call your Lead Qualifier assistant
2. Express interest in buying a car
3. The Lead Qualifier should transfer you to Sales
4. Test all the sales tools functionality
5. Try transferring from Sales to Finance or Service

## Troubleshooting

- Check Railway logs for any errors
- Verify all tool URLs point to your Railway deployment
- Ensure assistant IDs are correctly updated
- Test each tool individually before testing transfers