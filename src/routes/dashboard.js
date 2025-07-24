const express = require('express');
const router = express.Router();

// Mock dashboard data
router.get('/', (req, res) => {
    try {
        const mockData = {
            totalCalls: 12,
            leads: 8,
            appointments: 3,
            intentDistribution: {
                'sales': 6,
                'service': 3,
                'financing': 2,
                'general_inquiry': 1
            },
            recentCalls: [
                {
                    name: 'John Smith',
                    intent: 'sales',
                    outcome: 'interested'
                },
                {
                    name: 'Sarah Johnson',
                    intent: 'service',
                    outcome: 'appointment_scheduled'
                }
            ]
        };
        
        res.json(mockData);
        
    } catch (error) {
        console.error('L Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;