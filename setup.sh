#!/bin/bash

echo "🚀 Enhanced VAPI Dealership Setup Script"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required credentials"
    exit 1
fi

echo "📋 Step 1: Installing dependencies..."
npm install

echo ""
echo "🗄️ Step 2: Database Migration"
echo "Please run the following SQL in your Supabase SQL Editor:"
echo "File: migrations/full_enhanced_setup.sql"
echo ""
read -p "Press enter when migrations are complete..."

echo ""
echo "📦 Step 3: Importing inventory data..."
echo "Running: npm run import-inventory"
node scripts/importInventory.js

echo ""
echo "📚 Step 4: Setting up education campaigns..."
node scripts/setupEducationCampaigns.js

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Wait for Railway deployment to complete (1-3 minutes)"
echo "2. Update VAPI assistant with new tool endpoints"
echo "3. Test with a phone call"
echo "4. Check email after 15-20 minutes"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"