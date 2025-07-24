#!/bin/bash

# Replace with your actual Railway URL
RAILWAY_URL="https://vapi-dealership-railway-production.up.railway.app"

echo "🧪 Testing Railway deployment..."
echo "URL: $RAILWAY_URL"
echo ""

# Test health endpoint
echo "1️⃣ Testing Health Endpoint:"
curl -s "$RAILWAY_URL/health" | python3 -m json.tool
echo -e "\n"

# Test VAPI config
echo "2️⃣ Testing VAPI Config:"
curl -s "$RAILWAY_URL/vapi/config" | python3 -m json.tool
echo -e "\n"

# Test root endpoint
echo "3️⃣ Testing Root Endpoint:"
curl -s "$RAILWAY_URL/" | python3 -m json.tool
echo -e "\n"

# Test inventory
echo "4️⃣ Testing Inventory:"
curl -s "$RAILWAY_URL/api/inventory" | python3 -m json.tool
echo -e "\n"

# Test VAPI webhook
echo "5️⃣ Testing VAPI Webhook:"
curl -s -X POST "$RAILWAY_URL/vapi/webhook" \
  -H "Content-Type: application/json" \
  -d '{"event":"test","call":{"id":"test123"}}' | python3 -m json.tool
echo -e "\n"

# Test inventory function
echo "6️⃣ Testing Inventory Function:"
curl -s -X POST "$RAILWAY_URL/vapi/function/checkInventory" \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota"}' | python3 -m json.tool
echo -e "\n"

echo "✅ All tests completed!"