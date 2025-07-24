const express = require('express');
const router = express.Router();

// Debug endpoint - REMOVE IN PRODUCTION
router.get('/env-check', (req, res) => {
    // Only allow in development or with secret key
    const secretKey = req.headers['x-debug-key'];
    
    if (process.env.NODE_ENV === 'production' && secretKey !== 'your-secret-debug-key') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json({
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        VAPI_CONFIGURED: {
            hasApiKey: !!process.env.VAPI_API_KEY,
            phoneNumber: process.env.VAPI_PHONE_NUMBER || 'Not set'
        },
        SUPABASE_CONFIGURED: {
            hasUrl: !!process.env.SUPABASE_URL,
            url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'Not set',
            hasKey: !!process.env.SUPABASE_ANON_KEY
        },
        GOOGLE_SHEETS_CONFIGURED: {
            hasCredentials: !!process.env.GOOGLE_SHEETS_CREDENTIALS,
            spreadsheetId: process.env.SPREADSHEET_ID || 'Not set'
        },
        GROQ_CONFIGURED: {
            hasKey: !!process.env.GROQ_API_KEY
        }
    });
});

module.exports = router;