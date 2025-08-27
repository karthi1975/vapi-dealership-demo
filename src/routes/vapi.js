const express = require('express');
const router = express.Router();

// VAPI webhook endpoint
router.post('/webhook', async (req, res) => {
    try {
        console.log('📞 VAPI webhook received:', req.body);
        
        const { event, call } = req.body;
        
        if (event === 'call-started') {
            console.log('📱 Call started:', call?.id);
            console.log('📞 From:', call?.customer?.number);
        }
        
        if (event === 'call-ended') {
            console.log('📱 Call ended:', call?.id);
            console.log('⏱️ Duration:', call?.duration);
            console.log('📝 Transcript:', call?.transcript);
            
            // Try to save the transcript to Google Sheets if we have it
            if (call?.transcript || call?.messages) {
                const googleSheets = require('../services/googleSheets');
                
                // Format the conversation
                let transcript = '';
                if (call?.messages && Array.isArray(call.messages)) {
                    transcript = call.messages.map(msg => 
                        `${msg.role || 'unknown'}: ${msg.content || msg.message || ''}`
                    ).join('\n');
                } else if (call?.transcript) {
                    transcript = call.transcript;
                }
                
                // Create lead data from call end event
                const leadData = {
                    customerInfo: {
                        name: call?.customer?.name || 'Unknown',
                        phoneNumber: call?.customer?.number || 'Unknown'
                    },
                    callDuration: call?.duration || 'N/A',
                    outcome: 'Call Ended',
                    summary: `Call ${call?.id} ended after ${call?.duration || 0} seconds`,
                    transcript: transcript || 'No transcript available',
                    callId: call?.id
                };
                
                try {
                    await googleSheets.appendLeadData(leadData);
                    console.log('✅ Call transcript saved to Google Sheets');
                } catch (error) {
                    console.error('❌ Failed to save transcript:', error.message);
                }
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Webhook received',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ 
            error: 'Webhook processing failed',
            message: error.message 
        });
    }
});

// VAPI configuration check
router.get('/config', (req, res) => {
    const hasApiKey = !!process.env.VAPI_API_KEY;
    const hasPhoneNumber = !!process.env.VAPI_PHONE_NUMBER;
    
    res.json({
        configured: hasApiKey && hasPhoneNumber,
        apiKey: hasApiKey ? 'Set' : 'Missing',
        phoneNumber: hasPhoneNumber ? process.env.VAPI_PHONE_NUMBER : 'Missing',
        webhookUrl: `${req.protocol}://${req.get('host')}/vapi/webhook`
    });
});

// Basic inventory function for VAPI
router.post('/function/checkInventory', async (req, res) => {
    try {
        console.log('🔍 Inventory search:', req.body);
        
        res.json({
            result: "I found several great vehicles for you! We have a 2023 Toyota Camry for $28,999, a 2024 Honda Civic for $32,999, and a 2023 Ford F-150 for $45,999. Would you like more details about any of these vehicles?"
        });
        
    } catch (error) {
        console.error('❌ Inventory function error:', error);
        res.json({
            result: "I'm having trouble accessing our inventory right now. Let me transfer you to a sales representative."
        });
    }
});

// Transfer to human function
router.post('/function/transferToHuman', async (req, res) => {
    try {
        const { reason } = req.body;
        console.log('🔄 Transfer requested:', reason);
        
        res.json({
            result: "I'll connect you with one of our specialists right away. Please hold for just a moment."
        });
        
    } catch (error) {
        console.error('❌ Transfer error:', error);
        res.json({
            result: "Let me get someone to help you right away."
        });
    }
});

module.exports = router;
