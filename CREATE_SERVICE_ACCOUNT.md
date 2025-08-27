# How to Create a New Google Service Account for Sheets Access

Since the old service account was deleted, follow these steps to create a new one:

## Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com
2. Sign in with your Google account (the one that owns the spreadsheet)

## Step 2: Create or Select Project
1. Click on the project dropdown at the top
2. Either:
   - Select existing project "vapi-dealership-demo" if it exists, OR
   - Click "New Project" and create one named "vapi-dealership-demo"

## Step 3: Enable Google Sheets API
1. In the left menu, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 4: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "Service account"
3. Fill in:
   - Service account name: `vapi-sheets-service`
   - Service account ID: (auto-generated)
   - Description: "Service account for VAPI dealership Google Sheets integration"
4. Click "CREATE AND CONTINUE"
5. Skip the optional steps (Grant access and Grant users) by clicking "CONTINUE" and "DONE"

## Step 5: Generate JSON Key
1. In the Credentials page, find your new service account
2. Click on the service account email
3. Go to the "KEYS" tab
4. Click "ADD KEY" > "Create new key"
5. Choose "JSON" format
6. Click "CREATE" - This will download a JSON file to your computer

## Step 6: Update Your .env File
1. Open the downloaded JSON file
2. Copy the ENTIRE content
3. In your `.env` file, replace the `GOOGLE_SHEETS_CREDENTIALS` value:
   ```
   GOOGLE_SHEETS_CREDENTIALS='PASTE_THE_ENTIRE_JSON_HERE'
   ```
   Make sure it's wrapped in single quotes and all on one line!

## Step 7: Get the Service Account Email
From the JSON file, find the `client_email` field. It will look like:
```
something@your-project.iam.gserviceaccount.com
```

## Step 8: Share Your Google Sheet
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1rcTY673C9dQlRoEqHJxDX0BnoKY1NURnKuJlsvCAxhA
2. Click "Share" button
3. Add the service account email (from Step 7)
4. Set permission to "Editor"
5. Uncheck "Notify people"
6. Click "Share"

## Step 9: Test Locally
```bash
node test-google-sheets.js
```

You should see:
```
✅ Google Sheets service initialized and connected
✅ Successfully wrote test data to Google Sheets!
```

## Step 10: Update Railway
1. Go to your Railway dashboard
2. Go to Variables section
3. Update `GOOGLE_SHEETS_CREDENTIALS` with the new JSON (same as in .env)
4. Redeploy

## Example of what the JSON credentials look like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "some-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Important Notes:
- Keep the JSON key file secure - it provides full access to the sheets
- The service account email must have Editor access to the spreadsheet
- The JSON must be valid (use a JSON validator if you get parse errors)
- In .env, the entire JSON must be on ONE LINE wrapped in single quotes