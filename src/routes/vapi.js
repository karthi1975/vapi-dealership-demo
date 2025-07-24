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

module.exports = router;
