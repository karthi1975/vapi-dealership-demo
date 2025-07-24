#\!/bin/bash
curl -X POST https://vapi-dealership-demo-production.up.railway.app/vapi-tools/tool-calls \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "role": "assistant",
      "toolCalls": [
        {
          "id": "call_test123",
          "type": "function",
          "function": {
            "name": "leadQualification",
            "arguments": {
              "callId": "test-call-123",
              "customerInfo": {
                "phoneNumber": "+1234567890",
                "name": "Test Customer",
                "email": "test@example.com",
                "budget": 30000,
                "urgency": "medium",
                "intent": "buy"
              }
            }
          }
        }
      ]
    }
  }' | jq
