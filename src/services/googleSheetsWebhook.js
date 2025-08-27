class GoogleSheetsWebhook {
    constructor() {
        this.webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK;
        this.initialized = !!this.webhookUrl;
        
        if (this.initialized) {
            console.log('✅ Google Sheets webhook configured');
        } else {
            console.log('⚠️ Google Sheets webhook not configured - using service account instead');
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
                console.log('✅ Lead data sent to Google Sheets via webhook');
                return result;
            } else {
                console.error('❌ Google Sheets webhook error:', result.error);
            }
        } catch (error) {
            console.error('❌ Failed to send to Google Sheets webhook:', error.message);
        }
        return null;
    }
}

module.exports = new GoogleSheetsWebhook();