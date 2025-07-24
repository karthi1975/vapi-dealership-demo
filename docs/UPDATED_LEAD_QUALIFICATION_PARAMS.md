# Updated Lead Qualification Tool Parameters

## VAPI Tool Configuration

Update your `leadQualification` tool in VAPI with these enhanced parameters:

```json
{
  "type": "object",
  "properties": {
    "callId": {
      "type": "string",
      "description": "Unique identifier for the current call"
    },
    "customerInfo": {
      "type": "object",
      "description": "Customer information including phone number, name, email, budget, vehicle preferences",
      "required": ["phoneNumber"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Customer's name"
        },
        "phoneNumber": {
          "type": "string",
          "description": "Customer's phone number"
        },
        "email": {
          "type": "string",
          "description": "Customer's email address"
        },
        "budget": {
          "type": "number",
          "description": "Customer's budget for vehicle purchase"
        },
        "preferredMake": {
          "type": "string",
          "description": "Preferred vehicle manufacturer (Toyota, Honda, Ford, etc.)"
        },
        "preferredModel": {
          "type": "string",
          "description": "Preferred vehicle model (Camry, Accord, F-150, etc.)"
        },
        "vehicleType": {
          "type": "string",
          "description": "Type of vehicle (sedan, SUV, truck, minivan, etc.)",
          "enum": ["sedan", "suv", "truck", "minivan", "coupe", "convertible", "hatchback", "wagon", "other"]
        },
        "timeline": {
          "type": "string",
          "description": "When they plan to purchase",
          "enum": ["immediate", "within_week", "within_month", "within_3_months", "just_browsing"]
        },
        "urgency": {
          "type": "string",
          "description": "Urgency level (low, medium, high)",
          "enum": ["low", "medium", "high"]
        },
        "intent": {
          "type": "string",
          "description": "Customer's intent (buy, browse, finance, trade-in)",
          "enum": ["buy", "browse", "finance", "trade-in", "lease"]
        }
      }
    }
  },
  "required": ["callId", "customerInfo"]
}
```

## Updated System Prompt for Lead Qualifier Assistant

```
You are a friendly car dealership assistant helping customers find their perfect vehicle. Your job is to qualify leads by gathering important information naturally during the conversation.

When a customer calls, warmly greet them and use the leadQualification tool to collect:

REQUIRED:
- Their name
- Phone number (confirm the number they're calling from)

IMPORTANT TO GATHER:
- Budget range for their vehicle purchase
- Preferred make (Toyota, Honda, Ford, etc.)
- Preferred model (Camry, Accord, F-150, etc.)
- Vehicle type (sedan, SUV, truck, etc.)
- Purchase timeline (immediate, within a week, month, etc.)
- Urgency level (high, medium, low)
- Intent (buy, browse, finance, trade-in, lease)

OPTIONAL:
- Email address for follow-up

Be conversational and natural. Don't make it feel like an interrogation. If they mention a specific car like "I want a Toyota Camry", extract both the make (Toyota) and model (Camry) separately.

Examples:
- "I need a car urgently" → urgency: "high", timeline: "immediate"
- "Just looking around" → intent: "browse", urgency: "low"
- "I want to buy a Honda CR-V" → preferredMake: "Honda", preferredModel: "CR-V", vehicleType: "suv"
- "My budget is around 30k" → budget: 30000

For the callId parameter, use the current call's ID from the call object.

Once you've gathered the information, use the leadQualification tool to save it, then offer to transfer them to the appropriate specialist.
```

## Test Curl Command

```bash
curl -X POST https://vapi-dealership-demo-production.up.railway.app/vapi-tools \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "tool-calls",
      "timestamp": 1753379169800,
      "toolCalls": [{
        "id": "call_test123",
        "type": "function",
        "function": {
          "name": "leadQualification",
          "arguments": {
            "callId": "test-call-123",
            "customerInfo": {
              "phoneNumber": "+18016809129",
              "name": "John Smith",
              "email": "john@example.com",
              "budget": 35000,
              "preferredMake": "Toyota",
              "preferredModel": "Camry",
              "vehicleType": "sedan",
              "timeline": "within_week",
              "urgency": "high",
              "intent": "buy"
            }
          }
        }
      }]
    }
  }' | jq
```

## Database Changes Required

Run this SQL in your Supabase SQL editor:

```sql
-- Alter customers table to add vehicle preference fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS preferred_make VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_model VARCHAR(50),
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS purchase_timeline VARCHAR(50);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_make ON customers(preferred_make);
CREATE INDEX IF NOT EXISTS idx_customers_budget ON customers(budget);
```