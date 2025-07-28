# Enhanced VAPI Dealership Deployment Guide

## Prerequisites
- Node.js 20.x installed
- Supabase account with project created
- Google Cloud account with Sheets API enabled
- VAPI account with API key
- Railway account for deployment
- Email service (SendGrid/Gmail/SMTP)

## Step 1: Database Setup

### Run migrations in Supabase:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/full_enhanced_setup.sql`
4. Paste and execute in SQL Editor
5. Verify tables are created:
   - inventory
   - vehicle_interests
   - call_transcripts
   - communication_logs
   - shared_links
   - sales_assignments
   - education_campaigns

## Step 2: Import Inventory Data

### Option A: Run locally (if you have Supabase credentials)
```bash
npm run import-inventory
```

### Option B: Manual import via Supabase
1. Go to Table Editor in Supabase
2. Select `inventory` table
3. Use Import CSV feature
4. Upload `100 Used_Cars_Inventory.csv`
5. Map columns accordingly

## Step 3: Setup Education Campaigns

```bash
node scripts/setupEducationCampaigns.js
```

This will populate the education_campaigns table with pre-written content.

## Step 4: Configure Environment Variables

Update your `.env` file with all required values:

### Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `GOOGLE_SHEETS_CREDENTIALS` - Service account JSON
- `SPREADSHEET_ID` - Your Google Sheet ID
- `VAPI_API_KEY` - Your VAPI API key

### Email Configuration (choose one):
- SendGrid: `EMAIL_SERVICE=sendgrid` and `SENDGRID_API_KEY`
- Gmail: `EMAIL_SERVICE=gmail`, `EMAIL_USER`, and `EMAIL_APP_PASSWORD`
- SMTP: `EMAIL_SERVICE=smtp` with SMTP settings

## Step 5: Deploy to Railway

### Via Railway CLI:
```bash
railway login
railway link
railway up
```

### Via GitHub:
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Railway will auto-deploy on push

### Set Environment Variables in Railway:
1. Go to your Railway project
2. Click on Variables
3. Add all environment variables from `.env`
4. Railway will redeploy automatically

## Step 6: Update VAPI Assistant

### Add Enhanced Tools to your VAPI Assistant:
1. Go to VAPI Dashboard
2. Edit your Lead Qualifier Assistant
3. Add new tool endpoints:
   - `https://your-app.railway.app/vapi-tools-enhanced/enhanced-lead-qualification`
   - `https://your-app.railway.app/vapi-tools-enhanced/enhanced-inventory-search`

### Tool Configurations:

#### Enhanced Lead Qualification Tool:
```json
{
  "name": "enhancedLeadQualification",
  "description": "Capture detailed vehicle preferences including year, mileage, stock number",
  "parameters": {
    "customerInfo": {
      "type": "object",
      "properties": {
        "name": "string",
        "phoneNumber": "string",
        "email": "string",
        "preferredYear": "number",
        "preferredMake": "string",
        "preferredModel": "string",
        "minMileage": "number",
        "maxMileage": "number",
        "budget": "number",
        "stockNumber": "string",
        "timeline": "string",
        "intent": "string"
      }
    },
    "callId": "string"
  }
}
```

#### Enhanced Inventory Search Tool:
```json
{
  "name": "enhancedInventorySearch",
  "description": "Search inventory with detailed filters and generate shareable links",
  "parameters": {
    "criteria": {
      "type": "object",
      "properties": {
        "year": "number",
        "make": "string",
        "model": "string",
        "stockNumber": "string",
        "minMileage": "number",
        "maxMileage": "number",
        "priceMin": "number",
        "priceMax": "number"
      }
    },
    "callId": "string",
    "customerId": "string"
  }
}
```

## Step 7: Test the System

### 1. Health Check:
```bash
curl https://your-app.railway.app/health
```

### 2. Test VAPI Call:
- Call your VAPI phone number
- Ask about specific vehicles (year, make, model)
- Provide your email for follow-up
- Check if inventory link is generated

### 3. Verify Communications:
- Check email inbox after 15-20 minutes
- Verify Google Sheets is updated
- Check Supabase tables for data

## Step 8: Monitor & Maintain

### Check Logs:
- Railway Dashboard → Logs
- Look for communication scheduler activity
- Monitor for any errors

### Database Monitoring:
- Check `communication_logs` table for email status
- Monitor `shared_links` for usage
- Review `call_transcripts` for quality

## Troubleshooting

### Emails not sending:
1. Check EMAIL_SERVICE configuration
2. Verify credentials are correct
3. Check communication_logs table for errors
4. Review server logs for email service errors

### Inventory not showing:
1. Verify inventory table has data
2. Check searchInventory function logs
3. Ensure price/mileage filters aren't too restrictive

### Links not working:
1. Verify BASE_URL is correct
2. Check shared_links table
3. Ensure inventory route is accessible

## Production Checklist

- [ ] All environment variables set in Railway
- [ ] Database migrations completed
- [ ] Inventory data imported
- [ ] Education campaigns loaded
- [ ] Email service tested
- [ ] VAPI assistant updated with new tools
- [ ] Health check passing
- [ ] Test call completed successfully
- [ ] Follow-up email received
- [ ] Google Sheets updating correctly

## Support

For issues:
1. Check Railway logs
2. Review Supabase logs
3. Test individual components
4. Verify all credentials are correct