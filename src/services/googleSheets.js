const { google } = require('googleapis');

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
            // Parse the credentials from environment variable
            const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
            
            // Create auth client
            this.auth = new google.auth.GoogleAuth({
                credentials: credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });

            // Get sheets API
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            this.initialized = true;
            console.log('✅ Google Sheets service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Google Sheets:', error.message);
        }
    }

    async appendLeadData(leadData) {
        try {
            if (!this.initialized) {
                console.error('❌ Google Sheets not initialized');
                return null;
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