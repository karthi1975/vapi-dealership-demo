const { google } = require('googleapis');
const googleSheetsWebhook = require('./googleSheetsWebhook');

class GoogleSheetsService {
    constructor() {
        this.sheets = null;
        this.auth = null;
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Check for required environment variables
            if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
                console.log('⚠️ Google Sheets: GOOGLE_SHEETS_CREDENTIALS not set');
                return;
            }
            
            if (!process.env.SPREADSHEET_ID) {
                console.log('⚠️ Google Sheets: SPREADSHEET_ID not set');
                return;
            }
            
            // Parse the credentials from environment variable
            let credentials;
            try {
                credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
            } catch (parseError) {
                console.error('❌ Failed to parse GOOGLE_SHEETS_CREDENTIALS:', parseError.message);
                return;
            }
            
            // Validate required fields in credentials
            if (!credentials.client_email || !credentials.private_key) {
                console.error('❌ Google Sheets credentials missing required fields (client_email or private_key)');
                return;
            }
            
            // Create auth client
            this.auth = new google.auth.GoogleAuth({
                credentials: credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });

            // Get sheets API
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            
            // Test the connection
            try {
                await this.sheets.spreadsheets.get({
                    spreadsheetId: this.spreadsheetId
                });
                this.initialized = true;
                console.log('✅ Google Sheets service initialized and connected');
            } catch (testError) {
                console.error('❌ Google Sheets connection test failed:', testError.message);
                console.log('   Please check:');
                console.log('   1. The service account has access to the spreadsheet');
                console.log('   2. The SPREADSHEET_ID is correct');
                console.log('   3. Share the spreadsheet with:', credentials.client_email);
            }
        } catch (error) {
            console.error('❌ Failed to initialize Google Sheets:', error.message);
        }
    }

    async appendLeadData(leadData) {
        try {
            // If service account is not initialized, try webhook
            if (!this.initialized) {
                console.log('⚠️ Service account not initialized, trying webhook...');
                return await googleSheetsWebhook.appendLeadData(leadData);
            }

            // Format the data for the spreadsheet matching your columns
            const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
            const vehicleInterest = `${leadData.customerInfo?.preferredMake || ''} ${leadData.customerInfo?.preferredModel || ''}`.trim() || 'Not specified';
            const leadScore = this.calculateLeadScore(leadData);
            
            const row = [
                timestamp,                                      // Timestamp
                leadData.customerInfo?.name || '',              // Customer Name
                leadData.customerInfo?.phoneNumber || '',       // Phone Number
                leadData.customerInfo?.intent || 'browse',      // Intent
                vehicleInterest,                                // Vehicle Interest
                leadData.callDuration || 'In Progress',         // Call Duration
                leadData.outcome || 'Transferred to Sales',     // Outcome
                leadScore,                                      // Lead Score
                leadData.summary || ''                          // Summary
            ];

            // Append the row to the spreadsheet
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Sheet1!A:I',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [row]
                }
            });

            console.log('✅ Lead data written to Google Sheets:', response.data.updates);
            return response.data;
        } catch (error) {
            console.error('❌ Error writing to Google Sheets:', error.message);
            return null;
        }
    }

    calculateLeadScore(leadData) {
        let score = 0;
        
        // Budget scoring
        const budget = leadData.customerInfo?.budget || 0;
        if (budget >= 50000) score += 30;
        else if (budget >= 30000) score += 20;
        else if (budget >= 20000) score += 10;
        
        // Urgency scoring
        if (leadData.customerInfo?.urgency === 'high') score += 30;
        else if (leadData.customerInfo?.urgency === 'medium') score += 15;
        
        // Timeline scoring
        const timeline = leadData.customerInfo?.timeline?.toLowerCase() || '';
        if (timeline.includes('today') || timeline.includes('now')) score += 30;
        else if (timeline.includes('week')) score += 20;
        else if (timeline.includes('month')) score += 10;
        
        // Intent scoring
        if (leadData.customerInfo?.intent === 'buy') score += 10;
        
        return Math.min(score, 100); // Cap at 100
    }

    async createHeaderRow() {
        try {
            if (!this.initialized) return;

            const headers = [
                'Timestamp',
                'Customer Name',
                'Phone Number',
                'Intent',
                'Vehicle Interest',
                'Call Duration',
                'Outcome',
                'Lead Score',
                'Summary'
            ];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'Sheet1!A1:I1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [headers]
                }
            });

            console.log('✅ Header row created in Google Sheets');
        } catch (error) {
            console.error('❌ Error creating header row:', error.message);
        }
    }
}

// Export singleton instance
module.exports = new GoogleSheetsService();