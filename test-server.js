const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.json({ 
        message: 'Test server working',
        port: PORT,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        port: PORT,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 