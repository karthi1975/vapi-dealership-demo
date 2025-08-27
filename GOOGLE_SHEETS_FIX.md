# Fix Google Sheets Integration

## The Issue
Google Sheets is not writing data because the service account doesn't have access to the spreadsheet.

## Solution Steps

### 1. Grant Access to Service Account
The service account email is: `vapi-sheets-service@vapi-dealership-demo.iam.gserviceaccount.com`

1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1rcTY673C9dQlRoEqHJxDX0BnoKY1NURnKuJlsvCAxhA
2. Click the **Share** button (top right)
3. Add the service account email: `vapi-sheets-service@vapi-dealership-demo.iam.gserviceaccount.com`
4. Set permission to **Editor**
5. Uncheck "Notify people" (service accounts don't need email notifications)
6. Click **Share**

### 2. Verify in Railway Dashboard
Make sure these environment variables are set in Railway:

- `GOOGLE_SHEETS_CREDENTIALS` - The full JSON credential (already in your .env)
- `SPREADSHEET_ID` - `1rcTY673C9dQlRoEqHJxDX0BnoKY1NURnKuJlsvCAxhA`

### 3. Test Locally
Run this command to test:
```bash
node test-google-sheets.js
```

### 4. Expected Columns in Google Sheet
Make sure your Google Sheet has these columns in row 1:
- A: Timestamp
- B: Customer Name  
- C: Phone Number
- D: Intent
- E: Vehicle Interest
- F: Call Duration
- G: Outcome
- H: Lead Score
- I: Summary

## Alternative: Regenerate Service Account (if needed)

If the service account is invalid, you may need to create a new one:

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your project: `vapi-dealership-demo`
3. Go to IAM & Admin > Service Accounts
4. Create a new service account or get new keys for existing one
5. Download the JSON key file
6. Update `GOOGLE_SHEETS_CREDENTIALS` in your .env and Railway

## Verification
Once fixed, the logs should show:
```
✅ Google Sheets service initialized and connected
✅ Lead data written to Google Sheets
```