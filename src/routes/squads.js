const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// Squad Configuration
const SQUAD_CONFIG = {
    leadQualifier: {
        name: "Lead Qualifier",
        role: "Qualify potential customers and gather basic information",
        transferConditions: {
            qualified: "transferToSales",
            notInterested: "transferToFollowUp",
            urgent: "transferToManager"
        }
    },
    salesAgent: {
        name: "Sales Agent", 
        role: "Handle qualified leads, show vehicles, and close sales",
        transferConditions: {
            testDrive: "transferToTestDrive",
            financing: "transferToFinance",
            manager: "transferToManager"
        }
    },
    testDriveCoordinator: {
        name: "Test Drive Coordinator",
        role: "Schedule and coordinate test drives",
        transferConditions: {
            scheduled: "transferToSales",
            unavailable: "transferToSales"
        }
    },
    financeSpecialist: {
        name: "Finance Specialist",
        role: "Handle financing, loans, and payment options",
        transferConditions: {
            approved: "transferToSales",
            declined: "transferToManager"
        }
    },
    manager: {
        name: "Sales Manager",
        role: "Handle escalated situations and special requests",
        transferConditions: {
            resolved: "transferToSales",
            followUp: "transferToFollowUp"
        }
    },
    followUpAgent: {
        name: "Follow Up Agent",
        role: "Follow up with prospects and maintain relationships",
        transferConditions: {
            interested: "transferToSales",
            notInterested: "endCall"
        }
    }
};

// Squad Transfer Logic
function determineTransfer(currentAgent, conversationContext) {
    const { intent, customerType, urgency, stage } = conversationContext;
    
    switch(currentAgent) {
        case 'leadQualifier':
            if (urgency === 'high') return 'manager';
            if (intent === 'buy' && customerType === 'qualified') return 'salesAgent';
            if (intent === 'browse') return 'followUpAgent';
            return 'salesAgent';
            
        case 'salesAgent':
            if (intent === 'testDrive') return 'testDriveCoordinator';
            if (intent === 'financing') return 'financeSpecialist';
            if (urgency === 'high' || intent === 'escalate') return 'manager';
            return 'salesAgent';
            
        case 'testDriveCoordinator':
            return 'salesAgent';
            
        case 'financeSpecialist':
            if (intent === 'approved') return 'salesAgent';
            if (intent === 'declined') return 'manager';
            return 'salesAgent';
            
        case 'manager':
            if (intent === 'resolved') return 'salesAgent';
            return 'followUpAgent';
            
        case 'followUpAgent':
            if (intent === 'interested') return 'salesAgent';
            return 'endCall';
            
        default:
            return 'salesAgent';
    }
}

// Squad Configuration Endpoint
router.get('/config', (req, res) => {
    res.json({
        squadName: "Car Dealership Squad",
        agents: Object.keys(SQUAD_CONFIG),
        configuration: SQUAD_CONFIG,
        webhookUrl: `${req.protocol}://${req.get('host')}/squads/webhook`,
        backgroundSounds: {
            office: "https://example.com/office-ambience.mp3",
            showroom: "https://example.com/showroom-ambience.mp3",
            testDrive: "https://example.com/road-ambience.mp3"
        }
    });
});

// Squad Webhook Handler
router.post('/webhook', async (req, res) => {
    try {
        console.log('🔄 Squad webhook received:', req.body);
        
        const { event, call, conversationContext } = req.body;
        
        if (event === 'call-started') {
            console.log('🚗 Squad call started:', call?.id);
            console.log('👤 Customer:', call?.customer?.number);
            
            // Create call record in database
            const callData = {
                phone_number: call?.customer?.number,
                start_time: new Date().toISOString(),
                status: 'active'
            };
            
            const callRecord = await supabase.createCall(callData);
            console.log('📝 Call record created:', callRecord?.id);
        }
        
        if (event === 'transfer-requested') {
            const { fromAgent, toAgent, reason } = req.body;
            console.log(`🔄 Transfer: ${fromAgent} → ${toAgent} (${reason})`);
            
            // Log transfer in database
            const transferData = {
                call_id: conversationContext?.callId,
                from_agent: fromAgent,
                to_agent: toAgent,
                reason: reason,
                conversation_context: conversationContext
            };
            
            await supabase.logTransfer(transferData);
            
            // Update conversation context
            const updatedContext = {
                ...conversationContext,
                currentAgent: toAgent,
                transferHistory: [
                    ...(conversationContext.transferHistory || []),
                    { from: fromAgent, to: toAgent, reason, timestamp: new Date().toISOString() }
                ]
            };
            
            res.json({
                success: true,
                transfer: {
                    toAgent,
                    reason,
                    context: updatedContext
                }
            });
        }
        
        if (event === 'call-ended') {
            console.log('📞 Squad call ended:', call?.id);
            console.log('⏱️ Duration:', call?.duration);
            console.log('🔄 Transfers:', conversationContext?.transferHistory?.length || 0);
            
            // Update call record with end time and summary
            const updateData = {
                end_time: new Date().toISOString(),
                call_duration: call?.duration,
                status: 'completed',
                outcome: conversationContext?.outcome || 'completed',
                summary: conversationContext?.summary || 'Call completed successfully'
            };
            
            await supabase.updateCall(conversationContext?.callId, updateData);
        }
        
        res.json({ 
            success: true, 
            message: 'Squad webhook processed',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Squad webhook error:', error);
        res.status(500).json({ 
            error: 'Squad webhook processing failed',
            message: error.message 
        });
    }
});

// Agent Transfer Function
router.post('/function/transferAgent', async (req, res) => {
    try {
        const { currentAgent, conversationContext, callId } = req.body;
        console.log('🔄 Transfer request:', { currentAgent, context: conversationContext });
        
        const nextAgent = determineTransfer(currentAgent, conversationContext);
        console.log(`🔄 Transferring to: ${nextAgent}`);
        
        // Log intent in database
        const intentData = {
            call_id: callId,
            intent_type: 'transfer',
            confidence: 0.95,
            details: {
                fromAgent: currentAgent,
                toAgent: nextAgent,
                reason: conversationContext?.transferReason || 'specialized_assistance'
            }
        };
        
        await supabase.logIntent(intentData);
        
        res.json({
            result: `I'll transfer you to our ${SQUAD_CONFIG[nextAgent].name} who can better assist you with that.`,
            transfer: {
                toAgent: nextAgent,
                agentName: SQUAD_CONFIG[nextAgent].name,
                agentRole: SQUAD_CONFIG[nextAgent].role
            }
        });
        
    } catch (error) {
        console.error('❌ Transfer function error:', error);
        res.json({
            result: "I'll connect you with the right person to help you."
        });
    }
});

// Agent Specialization Functions
router.post('/function/leadQualification', async (req, res) => {
    try {
        const { customerInfo, callId } = req.body;
        console.log('🔍 Lead qualification:', customerInfo);
        
        // Log customer intent
        const intentData = {
            call_id: callId,
            intent_type: 'lead_qualification',
            confidence: 0.90,
            details: customerInfo
        };
        
        await supabase.logIntent(intentData);
        
        // Create or update customer record
        if (customerInfo.phoneNumber) {
            let customer = await supabase.getCustomerByPhone(customerInfo.phoneNumber);
            if (!customer) {
                customer = await supabase.createCustomer({
                    phone_number: customerInfo.phoneNumber,
                    name: customerInfo.name,
                    email: customerInfo.email
                });
            }
        }
        
        res.json({
            result: "I'd be happy to help you find the perfect vehicle! Let me ask a few quick questions to better understand your needs. What type of vehicle are you looking for, and do you have a budget in mind?"
        });
        
    } catch (error) {
        console.error('❌ Lead qualification error:', error);
        res.json({
            result: "Let me transfer you to our sales team who can better assist you."
        });
    }
});

router.post('/function/salesConsultation', async (req, res) => {
    try {
        const { vehicleInterest, budget } = req.body;
        console.log('🚗 Sales consultation:', { vehicleInterest, budget });
        
        res.json({
            result: "Great! I can see you're interested in our vehicles. We have some excellent options that match your criteria. Would you like to schedule a test drive or discuss financing options?"
        });
        
    } catch (error) {
        console.error('❌ Sales consultation error:', error);
        res.json({
            result: "Let me get you connected with our test drive coordinator."
        });
    }
});

router.post('/function/testDriveScheduling', async (req, res) => {
    try {
        const { preferredTime, vehicle } = req.body;
        console.log('📅 Test drive scheduling:', { preferredTime, vehicle });
        
        res.json({
            result: "Perfect! I can help you schedule a test drive. We have availability this week. What day and time works best for you?"
        });
        
    } catch (error) {
        console.error('❌ Test drive scheduling error:', error);
        res.json({
            result: "Let me check our availability and get back to you."
        });
    }
});

router.post('/function/financeConsultation', async (req, res) => {
    try {
        const { creditScore, downPayment, vehiclePrice } = req.body;
        console.log('💰 Finance consultation:', { creditScore, downPayment, vehiclePrice });
        
        res.json({
            result: "I can help you explore financing options. We have competitive rates and flexible terms. What's your preferred monthly payment range?"
        });
        
    } catch (error) {
        console.error('❌ Finance consultation error:', error);
        res.json({
            result: "Let me connect you with our finance specialist."
        });
    }
});

// Analytics and Reporting Routes
router.get('/analytics/calls', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateRange = {
            start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: endDate || new Date().toISOString()
        };
        
        const analytics = await supabase.getCallAnalytics(dateRange);
        res.json({
            success: true,
            analytics: analytics
        });
        
    } catch (error) {
        console.error('❌ Analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to get analytics',
            message: error.message 
        });
    }
});

router.get('/analytics/agent/:agentName', async (req, res) => {
    try {
        const { agentName } = req.params;
        const { startDate, endDate } = req.query;
        const dateRange = {
            start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: endDate || new Date().toISOString()
        };
        
        const performance = await supabase.getAgentPerformance(agentName, dateRange);
        res.json({
            success: true,
            agentName,
            performance: performance
        });
        
    } catch (error) {
        console.error('❌ Agent performance error:', error);
        res.status(500).json({ 
            error: 'Failed to get agent performance',
            message: error.message 
        });
    }
});

module.exports = router; 