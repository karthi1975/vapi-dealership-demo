
const express = require('express');
const router = express.Router();

// Mock inventory data for initial testing
const mockInventory = [
    {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 28999,
        mileage: 15000,
        condition: 'used'
    },
    {
        id: '2',
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 32999,
        mileage: 0,
        condition: 'new'
    }
];

// Get inventory
router.get('/', (req, res) => {
    try {
        res.json({
            success: true,
            data: mockInventory,
            total: mockInventory.length
        });
    } catch (error) {
        console.error('❌ Inventory error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

module.exports = router;
