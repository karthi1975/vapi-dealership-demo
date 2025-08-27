const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();
// const communicationScheduler = require('./services/communicationScheduler'); // Disabled - not using Supabase

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://vapi-dealership-demo-production.up.railway.app'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const vapiRoutes = require('./routes/vapi');
const dashboardRoutes = require('./routes/dashboard');
const inventoryRoutes = require('./routes/inventory');
const inventoryDisplayRoutes = require('./routes/inventoryDisplay');
const squadsRoutes = require('./routes/squads');
const vapiToolsRoutes = require('./routes/vapi-tools');
const { router: vapiToolsEnhancedRoutes } = require('./routes/vapi-tools-enhanced');

// Routes
app.use('/vapi', vapiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/inventory', inventoryDisplayRoutes); // Public inventory display pages
app.use('/squads', squadsRoutes);
app.use('/vapi-tools', vapiToolsRoutes);
app.use('/vapi-tools-enhanced', vapiToolsEnhancedRoutes);

// Root POST handler for VAPI - redirect to vapi-tools
app.post('/', (req, res) => {
    console.log('📍 Root POST request received, redirecting to /vapi-tools');
    req.url = '/vapi-tools';
    vapiToolsRoutes(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
    const vapiConfigured = !!(process.env.VAPI_API_KEY && process.env.VAPI_PHONE_NUMBER);
    
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: Math.floor(process.uptime()),
        services: {
            vapi: vapiConfigured ? 'configured' : 'missing credentials',
            supabase: !!process.env.SUPABASE_URL ? 'configured' : 'missing',
            googleSheets: !!process.env.SPREADSHEET_ID ? 'configured' : 'missing',
            groq: !!process.env.GROQ_API_KEY ? 'configured' : 'missing'
        },
        webhookUrl: vapiConfigured ? `${req.protocol}://${req.get('host')}/vapi/webhook` : null,
        debug: {
            vapi_api_key_exists: !!process.env.VAPI_API_KEY,
            vapi_phone_exists: !!process.env.VAPI_PHONE_NUMBER,
            supabase_url_exists: !!process.env.SUPABASE_URL,
            spreadsheet_id_exists: !!process.env.SPREADSHEET_ID,
            groq_api_key_exists: !!process.env.GROQ_API_KEY
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: '🚗 VAPI Dealership Demo API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            vapi_webhook: '/vapi/webhook',
            vapi_config: '/vapi/config',
            inventory: '/api/inventory',
            dashboard: '/api/dashboard'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 Not Found:', {
        method: req.method,
        url: req.originalUrl,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({ 
        error: 'Internal server error',
        message: isDevelopment ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Server starting up...');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    
    // Start communication scheduler - Disabled as we're not using Supabase
    // communicationScheduler.start();
    console.log('📧 Communication scheduler disabled (not using Supabase)');
    
    console.log('✅ Server ready to receive requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    // communicationScheduler.stop(); // Disabled - not using Supabase
    process.exit(0);
});

module.exports = app;
