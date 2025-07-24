const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// Log all requests to vapi-tools
router.use((req, res, next) => {
    console.log('🔍 VAPI-TOOLS Request:', {
        method: req.method,
        path: req.path,
        fullUrl: req.originalUrl,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Root handler for vapi-tools
router.get('/', (req, res) => {
    res.json({
        message: 'VAPI Tools API',
        version: '1.0.0',
        endpoints: {
            toolCalls: 'POST /vapi-tools/tool-calls',
            functions: {
                leadQualification: 'POST /vapi-tools/function/leadQualification',
                checkInventory: 'POST /vapi-tools/function/checkInventory',
                testDriveScheduling: 'POST /vapi-tools/function/testDriveScheduling'
            }
        }
    });
});

// VAPI tool-calls webhook handler
router.post('/tool-calls', async (req, res) => {
    try {
        console.log('🔧 VAPI tool-calls webhook received');
        console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
        console.log('📋 Headers:', req.headers);
        
        // Extract the tool call from VAPI's format
        const { message } = req.body;
        
        if (!message || !message.toolCalls || !message.toolCalls[0]) {
            return res.status(400).json({
                error: 'Invalid tool call format'
            });
        }
        
        const toolCall = message.toolCalls[0];
        const functionName = toolCall.function.name;
        const args = toolCall.function.arguments;
        
        console.log(`🛠️ Tool called: ${functionName}`);
        console.log('📋 Arguments:', args);
        
        // Route to the appropriate function
        switch (functionName) {
            case 'leadQualification':
                return handleLeadQualification(args, res);
            case 'checkInventory':
                return handleCheckInventory(args, res);
            case 'testDriveScheduling':
                return handleTestDriveScheduling(args, res);
            case 'transferAgent':
                return handleTransferAgent(args, res);
            default:
                return res.status(400).json({
                    error: `Unknown function: ${functionName}`
                });
        }
        
    } catch (error) {
        console.error('❌ Tool-calls webhook error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Handler for leadQualification
async function handleLeadQualification(args, res) {
    const { customerInfo, callId } = args;
    
    console.log('🔍 Lead qualification processing:', { customerInfo, callId });
    
    if (!customerInfo || !callId) {
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'd be happy to help you find the perfect vehicle! Could you please provide your information?"
            }]
        });
    }
    
    // Process the lead qualification
    try {
        // Create or update customer
        if (customerInfo?.phoneNumber) {
            let customer = await supabase.getCustomerByPhone(customerInfo.phoneNumber);
            if (!customer) {
                customer = await supabase.createCustomer({
                    phone_number: customerInfo.phoneNumber,
                    name: customerInfo.name || null,
                    email: customerInfo.email || null
                });
                console.log('✅ Customer created:', customer?.id);
            }
        }
        
        const qualification = {
            qualified: customerInfo?.budget > 20000 || customerInfo?.urgency === 'high',
            intent: customerInfo?.intent || 'browse',
            urgency: customerInfo?.urgency || 'low',
            budget: customerInfo?.budget || 0
        };
        
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: `Thank you ${customerInfo.name || ''}! Based on your needs, I can help you find the perfect vehicle. What type of car are you looking for?`
            }]
        });
        
    } catch (error) {
        console.error('❌ Lead qualification error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'd be happy to help you find the perfect vehicle!"
            }]
        });
    }
}

// Test Supabase connection
router.get('/test-connection', async (req, res) => {
    const isConnected = await supabase.testConnection();
    res.json({ 
        connected: isConnected,
        initialized: supabase.initialized,
        hasClient: !!supabase.client
    });
});

// Test direct insert
router.post('/test-insert', async (req, res) => {
    try {
        const testData = {
            phone_number: '+1' + Date.now().toString().slice(-10),
            name: 'Test User ' + new Date().toISOString()
        };
        
        console.log('🧪 Testing direct insert:', testData);
        const result = await supabase.createCustomer(testData);
        
        res.json({
            success: !!result,
            data: result,
            testData
        });
    } catch (error) {
        console.error('Test insert error:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

// VAPI Tools and Functions for Multi-Agent System

// 1. Lead Qualification Tool
router.post('/function/leadQualification', async (req, res) => {
    try {
        console.log('📥 Full request body:', JSON.stringify(req.body, null, 2));
        console.log('📋 Headers:', req.headers);
        
        // VAPI might send parameters in different formats
        let customerInfo, callId, conversationContext;
        
        // Check if parameters are in root level
        if (req.body.parameters) {
            ({ customerInfo, callId, conversationContext } = req.body.parameters);
        } else if (req.body.message && req.body.message.toolCalls) {
            // VAPI v2 format
            const toolCall = req.body.message.toolCalls[0];
            if (toolCall && toolCall.function && toolCall.function.arguments) {
                ({ customerInfo, callId, conversationContext } = toolCall.function.arguments);
            }
        } else {
            // Direct parameters
            ({ customerInfo, callId, conversationContext } = req.body);
        }
        
        console.log('🔍 Extracted parameters:', { customerInfo, callId });

        // Validate required parameters
        if (!customerInfo || !callId) {
            console.log('❌ Missing required parameters');
            return res.json({
                result: "I'd be happy to help you find the perfect vehicle! What type of car are you looking for?",
                qualification: {
                    qualified: false,
                    intent: 'unknown',
                    urgency: 'low',
                    budget: 0
                },
                nextAgent: 'followUpAgent'
            });
        }

        // Log customer intent (call_id is a string, not UUID in the schema)
        const intentData = {
            call_id: callId || 'unknown',  // Ensure it's never null
            intent_type: 'lead_qualification',
            confidence: 0.90,
            details: customerInfo
        };

        console.log('📝 Attempting to log intent...');
        try {
            await supabase.logIntent(intentData);
        } catch (error) {
            console.log('⚠️ Intent logging failed (non-critical):', error.message);
            // Continue execution - this is not critical
        }

        // Create or update customer record
        if (customerInfo?.phoneNumber) {
            console.log('🔍 Checking for existing customer:', customerInfo.phoneNumber);
            let customer = await supabase.getCustomerByPhone(customerInfo.phoneNumber);
            
            if (!customer) {
                console.log('👤 Creating new customer...');
                const customerData = {
                    phone_number: customerInfo.phoneNumber,
                    name: customerInfo.name || null,
                    email: customerInfo.email || null
                };
                console.log('Customer data:', customerData);
                
                customer = await supabase.createCustomer(customerData);
                console.log('Customer creation result:', customer);
            } else {
                console.log('✅ Existing customer found:', customer.id);
            }
        }

        // Determine qualification result
        const qualification = {
            qualified: customerInfo?.budget > 20000 || customerInfo?.urgency === 'high',
            intent: customerInfo?.intent || 'browse',
            urgency: customerInfo?.urgency || 'low',
            budget: customerInfo?.budget || 0
        };

        res.json({
            result: `Thank you for your interest! Based on your needs, I can help you find the perfect vehicle. What type of car are you looking for?`,
            qualification: qualification,
            nextAgent: qualification.qualified ? 'salesAgent' : 'followUpAgent'
        });

    } catch (error) {
        console.error('❌ Lead qualification error:', error);
        res.json({
            result: "I'd be happy to help you find the perfect vehicle! What type of car are you looking for?"
        });
    }
});

// 2. Sales Consultation Tool
router.post('/function/salesConsultation', async (req, res) => {
    try {
        const { vehicleInterest, budget, callId, conversationContext } = req.body;
        console.log('🚗 Sales consultation tool called:', { vehicleInterest, budget, callId });

        // Log vehicle interest
        const interestData = {
            call_id: callId,
            make: vehicleInterest?.make,
            model: vehicleInterest?.model,
            year: vehicleInterest?.year,
            price_range_min: budget?.min || 0,
            price_range_max: budget?.max || 100000,
            condition: vehicleInterest?.condition || 'any'
        };

        await supabase.logVehicleInterest(interestData);

        // Check inventory for matches (simplified for now)
        const inventory = [];

        res.json({
            result: `Great! I can see you're interested in ${vehicleInterest?.make || 'a vehicle'}. We have some excellent options that match your criteria. Would you like to schedule a test drive or discuss financing options?`,
            inventory: inventory?.vehicles || [],
            nextAgent: vehicleInterest?.testDrive ? 'testDriveCoordinator' : 'salesAgent'
        });

    } catch (error) {
        console.error('❌ Sales consultation error:', error);
        res.json({
            result: "I can help you find the perfect vehicle. Would you like to schedule a test drive?"
        });
    }
});

// 3. Test Drive Scheduling Tool
router.post('/function/testDriveScheduling', async (req, res) => {
    try {
        const { preferredTime, vehicle, customerInfo, callId } = req.body;
        console.log('📅 Test drive scheduling tool called:', { preferredTime, vehicle, callId });

        // Create test drive booking
        const bookingData = {
            call_id: callId,
            customer_id: customerInfo?.id,
            vehicle_make: vehicle?.make,
            vehicle_model: vehicle?.model,
            vehicle_year: vehicle?.year,
            preferred_date: preferredTime?.date,
            preferred_time: preferredTime?.time,
            status: 'pending',
            notes: `Scheduled via VAPI call`
        };

        const booking = await supabase.createTestDriveBooking(bookingData);

        res.json({
            result: `Perfect! I've scheduled your test drive for ${preferredTime?.date} at ${preferredTime?.time}. You'll receive a confirmation shortly. Is there anything else I can help you with?`,
            booking: booking,
            nextAgent: 'salesAgent'
        });

    } catch (error) {
        console.error('❌ Test drive scheduling error:', error);
        res.json({
            result: "I can help you schedule a test drive. What day and time works best for you?"
        });
    }
});

// 4. Finance Consultation Tool
router.post('/function/financeConsultation', async (req, res) => {
    try {
        const { creditScore, downPayment, vehiclePrice, customerInfo, callId } = req.body;
        console.log('💰 Finance consultation tool called:', { creditScore, downPayment, vehiclePrice, callId });

        // Create financing application
        const applicationData = {
            call_id: callId,
            customer_id: customerInfo?.id,
            vehicle_price: vehiclePrice,
            down_payment: downPayment,
            loan_amount: vehiclePrice - downPayment,
            credit_score: creditScore,
            employment_status: 'unknown',
            monthly_income: 0,
            status: 'pending',
            notes: `Application started via VAPI call`
        };

        const application = await supabase.createFinancingApplication(applicationData);

        // Calculate approval likelihood
        const approvalLikelihood = creditScore > 650 ? 'high' : creditScore > 550 ? 'medium' : 'low';

        res.json({
            result: `I can help you with financing options. Based on your information, we have competitive rates available. Would you like to proceed with the application?`,
            application: application,
            approvalLikelihood: approvalLikelihood,
            nextAgent: approvalLikelihood === 'high' ? 'salesAgent' : 'manager'
        });

    } catch (error) {
        console.error('❌ Finance consultation error:', error);
        res.json({
            result: "I can help you explore financing options. What's your preferred monthly payment range?"
        });
    }
});

// 5. Transfer Agent Tool
router.post('/function/transferAgent', async (req, res) => {
    try {
        const { currentAgent, conversationContext, callId, reason } = req.body;
        console.log('🔄 Transfer agent tool called:', { currentAgent, reason, callId });

        // Determine next agent based on context
        let nextAgent = 'salesAgent'; // default

        if (reason === 'testDrive' || conversationContext?.intent === 'testDrive') {
            nextAgent = 'testDriveCoordinator';
        } else if (reason === 'financing' || conversationContext?.intent === 'financing') {
            nextAgent = 'financeSpecialist';
        } else if (reason === 'escalation' || conversationContext?.urgency === 'high') {
            nextAgent = 'manager';
        } else if (reason === 'followUp' || conversationContext?.intent === 'browse') {
            nextAgent = 'followUpAgent';
        }

        // Log transfer
        const transferData = {
            call_id: callId,
            from_agent: currentAgent,
            to_agent: nextAgent,
            reason: reason,
            conversation_context: conversationContext
        };

        await supabase.logTransfer(transferData);

        // Get agent info
        const agentInfo = {
            leadQualifier: { name: 'Lead Qualifier', role: 'Qualify potential customers' },
            salesAgent: { name: 'Sales Agent', role: 'Handle vehicle sales and consultations' },
            testDriveCoordinator: { name: 'Test Drive Coordinator', role: 'Schedule and coordinate test drives' },
            financeSpecialist: { name: 'Finance Specialist', role: 'Handle financing and loan options' },
            manager: { name: 'Sales Manager', role: 'Handle escalated situations' },
            followUpAgent: { name: 'Follow-up Agent', role: 'Maintain customer relationships' }
        };

        res.json({
            result: `I'll transfer you to our ${agentInfo[nextAgent]?.name} who can better assist you with that.`,
            transfer: {
                toAgent: nextAgent,
                agentName: agentInfo[nextAgent]?.name,
                agentRole: agentInfo[nextAgent]?.role,
                reason: reason
            }
        });

    } catch (error) {
        console.error('❌ Transfer agent error:', error);
        res.json({
            result: "I'll connect you with the right person to help you."
        });
    }
});

// 6. Check Inventory Tool
router.post('/function/checkInventory', async (req, res) => {
    try {
        const { make, model, year, maxPrice, callId } = req.body;
        console.log('🔍 Check inventory tool called:', { make, model, year, maxPrice, callId });

        // Query inventory
        const { data: inventory, error } = await supabase.client
            .from('inventory')
            .select('*')
            .eq('status', 'available')
            .lte('price', maxPrice || 100000);

        if (error) throw error;

        // Filter by criteria
        let matches = inventory || [];
        if (make) matches = matches.filter(v => v.make.toLowerCase().includes(make.toLowerCase()));
        if (model) matches = matches.filter(v => v.model.toLowerCase().includes(model.toLowerCase()));
        if (year) matches = matches.filter(v => v.year >= year);

        res.json({
            result: `I found ${matches.length} vehicles that match your criteria. ${matches.length > 0 ? 'Would you like to hear about them?' : 'Would you like me to search with different criteria?'}`,
            inventory: matches,
            count: matches.length
        });

    } catch (error) {
        console.error('❌ Check inventory error:', error);
        res.json({
            result: "I can help you check our inventory. What type of vehicle are you looking for?"
        });
    }
});

// 7. Get Promotions Tool
router.post('/function/getPromotions', async (req, res) => {
    try {
        const { callId } = req.body;
        console.log('🎉 Get promotions tool called:', { callId });

        // Get active promotions
        const { data: promotions, error } = await supabase.client
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .gte('valid_until', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        const activePromotions = promotions || [];

        res.json({
            result: `We have ${activePromotions.length} current promotions available! ${activePromotions.length > 0 ? 'Would you like to hear about them?' : 'Check back soon for new offers!'}`,
            promotions: activePromotions,
            count: activePromotions.length
        });

    } catch (error) {
        console.error('❌ Get promotions error:', error);
        res.json({
            result: "We have some great promotions available. Would you like to hear about them?"
        });
    }
});

// 8. End Call Tool
router.post('/function/endCall', async (req, res) => {
    try {
        const { callId, outcome, summary } = req.body;
        console.log('📞 End call tool called:', { callId, outcome, summary });

        // Update call record
        const updateData = {
            end_time: new Date().toISOString(),
            status: 'completed',
            outcome: outcome || 'completed',
            summary: summary || 'Call completed successfully'
        };

        await supabase.updateCall(callId, updateData);

        res.json({
            result: "Thank you for calling! We appreciate your business and look forward to serving you. Have a great day!",
            callEnded: true,
            outcome: outcome
        });

    } catch (error) {
        console.error('❌ End call error:', error);
        res.json({
            result: "Thank you for calling! Have a great day!"
        });
    }
});

module.exports = router; 