# Alternative: Use OAuth2 with Your Google Account

If creating a service account is too complex, here's an easier alternative using your personal Google account:

## Quick Setup with OAuth2

### Step 1: Install Google Sheets Add-on
We can modify the code to use OAuth2 with your personal Google account instead of a service account.

### Step 2: Update emailService.js to use OAuth
Replace the Google Sheets initialization with OAuth2:

```javascript
// In src/services/googleSheets.js
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleSheetsService {
    constructor() {
        this.sheets = null;
        this.auth = null;
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.initialized = false;
        this.initOAuth();
    }

    async initOAuth() {
        // Use API key instead of service account
        // This allows read-only access to public sheets
        // For write access, you'll need the service account
        
        // For now, we'll use a webhook to send data to Google Sheets
        console.log('⚠️ Google Sheets using webhook mode');
        this.initialized = true;
    }

    async appendLeadData(leadData) {
        // Send to a Google Apps Script Web App instead
        // This is much simpler to set up
        
        try {
            const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK;
            if (!webhookUrl) {
                console.log('⚠️ No Google Sheets webhook configured');
                return null;
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });

            if (response.ok) {
                console.log('✅ Data sent to Google Sheets via webhook');
                return { success: true };
            }
        } catch (error) {
            console.error('❌ Failed to send to Google Sheets:', error.message);
        }
        return null;
    }
}
```

## Easiest Solution: Google Apps Script Web App

### Step 1: Open Google Sheets
Go to your spreadsheet: https://docs.google.com/spreadsheets/d/1rcTY673C9dQlRoEqHJxDX0BnoKY1NURnKuJlsvCAxhA

### Step 2: Create Apps Script
1. Click **Extensions** > **Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Format the data
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
    const vehicleInterest = `${data.customerInfo?.preferredMake || ''} ${data.customerInfo?.preferredModel || ''}`.trim() || 'Not specified';
    const leadScore = calculateLeadScore(data);
    
    // Create row data
    const row = [
      timestamp,
      data.customerInfo?.name || '',
      data.customerInfo?.phoneNumber || '',
      data.customerInfo?.intent || 'browse',
      vehicleInterest,
      data.callDuration || 'In Progress',
      data.outcome || 'Transferred to Sales',
      leadScore,
      data.summary || ''
    ];
    
    // Append the row
    sheet.appendRow(row);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function calculateLeadScore(data) {
  let score = 0;
  
  // Budget scoring
  const budget = data.customerInfo?.budget || 0;
  if (budget >= 50000) score += 30;
  else if (budget >= 30000) score += 20;
  else if (budget >= 20000) score += 10;
  
  // Urgency scoring
  if (data.customerInfo?.urgency === 'high') score += 30;
  else if (data.customerInfo?.urgency === 'medium') score += 15;
  
  // Timeline scoring
  const timeline = (data.customerInfo?.timeline || '').toLowerCase();
  if (timeline.includes('today') || timeline.includes('now')) score += 30;
  else if (timeline.includes('week')) score += 20;
  else if (timeline.includes('month')) score += 10;
  
  // Intent scoring
  if (data.customerInfo?.intent === 'buy') score += 10;
  
  return Math.min(score, 100);
}

// Test function
function testSetup() {
  doPost({
    postData: {
      contents: JSON.stringify({
        customerInfo: {
          name: 'Test User',
          phoneNumber: '+1234567890',
          intent: 'buy',
          preferredMake: 'Toyota',
          preferredModel: 'Camry',
          budget: 30000,
          timeline: 'This week',
          urgency: 'high'
        },
        callDuration: '2:30',
        outcome: 'Test Entry',
        summary: 'Test from Apps Script'
      })
    }
  });
}
```

### Step 3: Deploy as Web App
1. Click **Deploy** > **New Deployment**
2. Click the gear icon ⚙️ > **Web app**
3. Set:
   - Description: "VAPI Dealership Webhook"
   - Execute as: **Me** (your email)
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the Web App URL (it will look like: https://script.google.com/macros/s/...../exec)

### Step 4: Update Your .env
Add this line to your `.env` file:
```
GOOGLE_SHEETS_WEBHOOK=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 5: Update the Code
Create a new file `src/services/googleSheetsWebhook.js`:

```javascript
class GoogleSheetsWebhook {
    constructor() {
        this.webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK;
        this.initialized = !!this.webhookUrl;
        
        if (this.initialized) {
            console.log('✅ Google Sheets webhook configured');
        } else {
            console.log('⚠️ Google Sheets webhook not configured');
        }
    }

    async appendLeadData(leadData) {
        if (!this.webhookUrl) {
            console.log('⚠️ No Google Sheets webhook URL');
            return null;
        }

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                redirect: 'follow',
                headers: { 
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify(leadData)
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Lead data sent to Google Sheets');
                return result;
            }
        } catch (error) {
            console.error('❌ Failed to send to Google Sheets:', error.message);
        }
        return null;
    }
}

module.exports = new GoogleSheetsWebhook();
```

This is MUCH simpler than dealing with service accounts!