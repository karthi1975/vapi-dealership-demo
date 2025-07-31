# 🚀 Complete Implementation Guide - VAPI Dealership System

This guide covers EVERY step from zero to a fully functioning AI-powered dealership system.

## Table of Contents
1. [Prerequisites & Accounts](#prerequisites--accounts)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Supabase Database Setup](#supabase-database-setup)
4. [Google Sheets Configuration](#google-sheets-configuration)
5. [VAPI Assistant Setup](#vapi-assistant-setup)
6. [Railway Deployment](#railway-deployment)
7. [Email Configuration](#email-configuration)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites & Accounts

### Required Accounts:
- [ ] **GitHub Account** - For code repository
- [ ] **Supabase Account** - Database (free tier works)
- [ ] **Google Account** - For Sheets API and Gmail
- [ ] **VAPI Account** - Voice AI platform
- [ ] **Railway Account** - Hosting platform
- [ ] **Domain (Optional)** - Custom domain for links

### Local Development:
- [ ] Node.js 20.x installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

---

## 2. Environment Variables Setup

### Complete .env File Template:

```bash
# === CORE CONFIGURATION ===
NODE_ENV=production
PORT=3000

# === SUPABASE CONFIGURATION ===
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key

# === GOOGLE SHEETS CONFIGURATION ===
# Get this JSON from Google Cloud Console
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"}'
SPREADSHEET_ID=1rcTY673C9dQlRoEqHJxDX0BnoKY1NURnKuJlsvCAxhA

# === VAPI CONFIGURATION ===
VAPI_API_KEY=your-vapi-api-key-here
VAPI_PHONE_NUMBER=+14754228650
VAPI_ASSISTANT_ID=your-assistant-id
DEALERSHIP_PHONE=+18016809129

# === EMAIL CONFIGURATION (Gmail) ===
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop  # 16-char app password, no spaces
EMAIL_FROM=your.email@gmail.com

# === ALTERNATIVE EMAIL (SendGrid) ===
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
# EMAIL_FROM=noreply@yourdomain.com

# === ALTERNATIVE EMAIL (SMTP) ===
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=username
# SMTP_PASS=password
# EMAIL_FROM=noreply@yourdomain.com

# === SMS CONFIGURATION (Optional) ===
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_PHONE_NUMBER=+1234567890
# SMS_ENABLED=true

# === APPLICATION SETTINGS ===
BASE_URL=https://your-app-name-production.up.railway.app
INVENTORY_BASE_URL=https://your-app-name-production.up.railway.app/inventory

# === NOTIFICATION SETTINGS ===
MANAGER_EMAILS=manager1@dealership.com,manager2@dealership.com
EMAIL_DELAY_MINUTES=20

# === OPTIONAL AI SERVICES ===
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization
4. Create new project:
   - Name: `vapi-dealership`
   - Database Password: (save this!)
   - Region: Choose closest to you

### Step 2: Get Credentials
1. Go to Settings → API
2. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`

### Step 3: Run Database Migrations
1. Go to SQL Editor in Supabase
2. Click "New Query"
3. Copy and paste entire contents of `migrations/full_enhanced_setup.sql`
4. Click "Run"
5. Verify tables created:
   - customers
   - inventory
   - vehicle_interests
   - call_transcripts
   - communication_logs
   - shared_links
   - sales_assignments
   - education_campaigns

### Step 4: Import Inventory Data
1. Go to Table Editor → inventory
2. Click "Insert" → "Import from CSV"
3. Upload `100 Used_Cars_Inventory.csv`
4. Map columns:
   - Stock ID → stock_number
   - Year → year
   - Make → make
   - Model → model
   - etc.
5. Click "Import"

---

## 4. Google Sheets Configuration

### Step 1: Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Sheets API:
   - APIs & Services → Library
   - Search "Google Sheets API"
   - Click Enable

### Step 2: Create Service Account Key
1. APIs & Services → Credentials
2. Create Credentials → Service Account
3. Name: `vapi-sheets-service`
4. Create and Continue
5. Skip optional steps
6. Click on created service account
7. Keys → Add Key → Create New Key
8. Choose JSON → Create
9. Save the downloaded JSON file

### Step 3: Setup Spreadsheet
1. Create new Google Sheet
2. Name it: "VAPI Dealership Leads"
3. Copy the spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS-IS-THE-ID]/edit
   ```
4. Share spreadsheet with service account email:
   - Click Share
   - Add email from JSON: `xxxxx@your-project.iam.gserviceaccount.com`
   - Give Editor access

### Step 4: Format Credentials for .env
1. Open the downloaded JSON
2. Copy entire contents
3. Format as single line (remove newlines)
4. Wrap in single quotes for .env file

---

## 5. VAPI Assistant Setup

### Step 1: Create VAPI Account
1. Go to [vapi.ai](https://vapi.ai)
2. Sign up for account
3. Get API key from Dashboard → API Keys

### Step 2: Get Phone Number
1. Dashboard → Phone Numbers
2. Buy new number or port existing
3. Copy number for `VAPI_PHONE_NUMBER`

### Step 3: Create Lead Qualifier Assistant
1. Dashboard → Assistants → Create New
2. Basic Settings:
   ```
   Name: Lead Qualifier
   First Message: "Thank you for calling! I'm here to help you find the perfect vehicle. May I have your name?"
   Model: GPT-4 or Claude
   Voice: Choose professional voice
   ```

### Step 4: Add System Prompt
```
You are a friendly automotive sales assistant helping customers find their perfect vehicle. Your primary goals are to:

1. Qualify the lead by gathering essential information
2. Understand their vehicle preferences in detail  
3. ALWAYS collect their email address to send vehicle matches

CRITICAL: You MUST collect the customer's email address. This is required to send them:
- Personalized inventory matches
- Pricing details
- Special offers
- Their dedicated salesperson's contact information

When collecting information:
1. Be conversational and friendly
2. Ask for name, phone, and email (required)
3. Understand their vehicle needs:
   - Specific year, make, model
   - Mileage preferences
   - Budget range
   - Timeline for purchase
   - Any specific stock numbers

Use the enhancedLeadQualification tool after gathering all information.
Use the enhancedInventorySearch tool if they want to hear about specific vehicles.

Email Collection Script:
- After getting their name and phone, say: "And what's the best email address to send you the vehicle details and pricing?"
- If they hesitate: "I understand your concern about privacy. We only use your email to send you the specific vehicles we discussed today."
- Always confirm: "Perfect! I'll send the details to [repeat email]. Is that correct?"
```

### Step 5: Add Tool Functions

#### Tool 1: Enhanced Lead Qualification
```json
{
  "type": "function",
  "function": {
    "name": "enhancedLeadQualification",
    "description": "Capture detailed customer information and vehicle preferences",
    "parameters": {
      "type": "object",
      "properties": {
        "customerInfo": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "phoneNumber": { "type": "string" },
            "email": { "type": "string" },
            "preferredYear": { "type": "number" },
            "preferredMake": { "type": "string" },
            "preferredModel": { "type": "string" },
            "minMileage": { "type": "number" },
            "maxMileage": { "type": "number" },
            "budget": { "type": "number" },
            "priceRangeMin": { "type": "number" },
            "priceRangeMax": { "type": "number" },
            "stockNumber": { "type": "string" },
            "timeline": { "type": "string" },
            "intent": { "type": "string" },
            "urgency": { "type": "string" },
            "vehicleType": { "type": "string" }
          },
          "required": ["name", "phoneNumber", "email"]
        },
        "callId": { "type": "string" }
      },
      "required": ["customerInfo", "callId"]
    },
    "server": {
      "url": "https://your-app-production.up.railway.app/vapi-tools-enhanced/enhanced-lead-qualification",
      "timeout_seconds": 20
    }
  }
}
```

#### Tool 2: Enhanced Inventory Search
```json
{
  "type": "function",
  "function": {
    "name": "enhancedInventorySearch",
    "description": "Search inventory and generate shareable links",
    "parameters": {
      "type": "object",
      "properties": {
        "criteria": {
          "type": "object",
          "properties": {
            "year": { "type": "number" },
            "make": { "type": "string" },
            "model": { "type": "string" },
            "stockNumber": { "type": "string" },
            "minMileage": { "type": "number" },
            "maxMileage": { "type": "number" },
            "priceMin": { "type": "number" },
            "priceMax": { "type": "number" }
          }
        },
        "callId": { "type": "string" },
        "customerId": { "type": "string" }
      },
      "required": ["criteria", "callId"]
    },
    "server": {
      "url": "https://your-app-production.up.railway.app/vapi-tools-enhanced/enhanced-inventory-search",
      "timeout_seconds": 20
    }
  }
}
```

### Step 6: Configure Webhooks (Optional)
1. Dashboard → Webhooks
2. Add webhook URL: `https://your-app.railway.app/vapi/webhook`
3. Select events to receive

---

## 6. Railway Deployment

### Step 1: Prepare GitHub Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/vapi-dealership-demo.git
cd vapi-dealership-demo

# Create .env file with all configurations
cp .env.example .env
# Edit .env with your values

# Commit any changes
git add .
git commit -m "Configure environment"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repository
5. Add environment variables:
   - Click on service
   - Variables tab
   - Add from .env (Raw Editor):
   ```
   Copy all contents from your .env file
   ```
   - Click "Update Variables"

### Step 3: Configure Domain (Optional)
1. Settings → Domains
2. Generate Domain or Add Custom Domain
3. Update `BASE_URL` in Railway variables

### Step 4: Verify Deployment
```bash
# Check deployment status
curl https://your-app.railway.app/health

# Should return:
{
  "status": "OK",
  "services": {
    "vapi": "configured",
    "supabase": "configured",
    "googleSheets": "configured"
  }
}
```

---

## 7. Email Configuration

### Gmail Setup:
1. Enable 2-Factor Authentication:
   - Google Account → Security
   - 2-Step Verification → Turn on

2. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail"
   - Generate
   - Copy 16-character password

3. Add to Railway:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your.email@gmail.com
   EMAIL_APP_PASSWORD=abcdefghijklmnop  # No spaces!
   EMAIL_FROM=your.email@gmail.com
   ```

### SendGrid Setup (Alternative):
1. Create SendGrid account
2. API Keys → Create API Key
3. Add to Railway:
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## 8. Testing & Verification

### Step 1: Test Database Connection
```bash
# Local test
node test-local.js

# Remote test
curl https://your-app.railway.app/vapi-tools/test-connection
```

### Step 2: Test Email System
```bash
# Create test file
node test-email-send.js

# Check logs
railway logs | grep -i email
```

### Step 3: Import Test Data
```bash
# Import inventory
npm run import-inventory

# Setup education campaigns
node scripts/setupEducationCampaigns.js
```

### Step 4: Make Test Call
1. Call your VAPI number
2. Say: "Hi, my name is John Smith"
3. Provide phone and email when asked
4. Say: "I'm looking for a 2018 Toyota Camry with less than 50,000 miles"
5. Wait for response about matches
6. End call

### Step 5: Verify Results
1. Check Google Sheets for new lead
2. Check email after 20 minutes
3. Click inventory link in email
4. Verify webpage displays vehicles

---

## 9. Troubleshooting

### Common Issues:

#### VAPI Not Responding:
- Check assistant ID in VAPI dashboard
- Verify webhook URL is correct
- Check Railway logs for errors

#### Emails Not Sending:
```bash
# Check email configuration
railway logs | grep -i "email service"

# Test email directly
railway run node test-email-send.js
```

#### Database Connection Failed:
- Verify Supabase URL and key
- Check if tables exist
- Test with Supabase dashboard

#### Google Sheets Not Updating:
- Verify service account has editor access
- Check spreadsheet ID is correct
- Look for errors in Railway logs

### Debug Commands:
```bash
# View all logs
railway logs

# Check specific service
railway logs | grep -i supabase
railway logs | grep -i "google sheets"
railway logs | grep -i error

# Test endpoints
curl https://your-app.railway.app/health
curl https://your-app.railway.app/api/inventory
```

---

## 📋 Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Create all required accounts
- [ ] Setup Supabase database
- [ ] Configure Google Sheets
- [ ] Create VAPI assistant

### Phase 2: Configuration (Day 2)
- [ ] Complete .env file
- [ ] Deploy to Railway
- [ ] Configure email service
- [ ] Import inventory data

### Phase 3: Testing (Day 3)
- [ ] Test phone calls
- [ ] Verify email delivery
- [ ] Check inventory links
- [ ] Validate Google Sheets

### Phase 4: Launch
- [ ] Train team on system
- [ ] Monitor first calls
- [ ] Review daily reports
- [ ] Gather feedback

---

## 🎯 Success Metrics

When fully implemented, you should see:
- ✅ Calls answered by AI within 2 rings
- ✅ Customer data captured in <2 minutes
- ✅ Emails sent within 20 minutes
- ✅ Inventory links clicked within 1 hour
- ✅ Google Sheets updated in real-time
- ✅ Daily reports at 8 AM

---

## 🆘 Support Resources

- **VAPI Documentation**: https://docs.vapi.ai
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Google Sheets API**: https://developers.google.com/sheets/api

---

## 🚀 Next Steps

1. **Customize AI personality** in VAPI assistant
2. **Add more inventory** to database
3. **Create custom email templates**
4. **Setup SMS with Twilio**
5. **Integrate with your CRM**
6. **Add payment calculator tool**
7. **Implement appointment scheduling**

This system is now ready to handle hundreds of calls per day and scale as your dealership grows!