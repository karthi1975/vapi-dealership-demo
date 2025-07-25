// Agent Transfer Handler for VAPI Multi-Agent System

const supabase = require('../services/supabase');

// Assistant IDs mapping (replace with your actual VAPI assistant IDs)
const ASSISTANT_IDS = {
    leadQualifier: '1506a9d9-a0d5-4439-9d83-f447bcedda1e',
    sales: 'edc301ed-7e86-48a5-8762-d1a584a52c10',
    service: 'your-service-assistant-id',
    finance: 'your-finance-assistant-id',
    parts: 'your-parts-assistant-id',
    human: 'human-transfer' // Special case for human handoff
};

// Handler for transferToAgent tool
async function handleTransferToAgent(args, res) {
    console.log('🔄 Full Transfer Arguments:', JSON.stringify(args, null, 2));
    
    const { targetAgent, context, callId } = args;
    
    console.log('🔄 Agent Transfer Request:', {
        from: 'current',
        to: targetAgent,
        callId: callId,
        hasContext: !!context,
        contextKeys: context ? Object.keys(context) : []
    });
    
    try {
        // Validate target agent
        if (!ASSISTANT_IDS[targetAgent]) {
            console.log('⚠️ Unknown target agent:', targetAgent, 'Defaulting to sales');
            const fallbackResponse = {
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "I'm sorry, I couldn't find that department. Let me connect you with our main sales team."
                }],
                transfer: {
                    assistantId: ASSISTANT_IDS.sales
                }
            };
            console.log('📤 Fallback Transfer Response:', JSON.stringify(fallbackResponse, null, 2));
            return res.json(fallbackResponse);
        }
        
        // Store context in database for the next agent
        if (context) {
            await supabase.storeCallContext({
                call_id: callId,
                context: context,
                target_agent: targetAgent,
                timestamp: new Date().toISOString()
            });
        }
        
        // Log the transfer
        await supabase.logTransfer({
            call_id: callId,
            from_agent: context?.currentAgent || 'leadQualifier',
            to_agent: targetAgent,
            reason: context?.intent || 'customer_request',
            conversation_context: context
        });
        
        // Handle human transfer specially
        if (targetAgent === 'human') {
            return res.json({
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "I'll connect you with one of our team members right away. Please hold for just a moment."
                }],
                // VAPI will handle the actual phone transfer
                transfer: {
                    type: 'phone',
                    phoneNumber: process.env.DEALERSHIP_PHONE || '+1234567890',
                    context: context
                }
            });
        }
        
        // TEMPORARY: Transfer to phone for sales until Squad is set up
        if (targetAgent === 'sales') {
            const phoneNumber = process.env.DEALERSHIP_PHONE || '+18016809129';
            console.log('📞 Transferring to dealership phone for sales:', phoneNumber);
            console.log('🔧 Tool Call ID:', args.toolCallId);
            
            // Based on VAPI docs - use transferCall type with destinations
            const transferResponse = {
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: {
                        type: "transferCall",
                        destinations: [{
                            type: "number",
                            number: phoneNumber,
                            message: `Transferring customer: ${context?.summary || 'Qualified lead for sales'}`
                        }]
                    }
                }]
            };
            
            console.log('📤 Phone Transfer Response:', JSON.stringify(transferResponse, null, 2));
            
            // VAPI phone transfer format from documentation
            return res.json(transferResponse);
        }
        
        // Get appropriate transfer message
        const transferMessages = {
            sales: "I'll transfer you to our sales specialist who can help you find the perfect vehicle.",
            service: "Let me connect you with our service department to schedule your appointment.",
            finance: "I'll transfer you to our finance expert who can discuss payment options with you.",
            parts: "Let me connect you with our parts department for availability and pricing."
        };
        
        // VAPI expects a specific response format for transfers
        // According to VAPI docs, the result should contain assistantId and action
        const transferResponse = {
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: {
                    assistantId: ASSISTANT_IDS[targetAgent],
                    action: "transfer"
                    // Remove message from here - it's not part of the VAPI spec
                }
            }]
        };
        
        console.log('📤 Transfer Response:', JSON.stringify(transferResponse, null, 2));
        console.log('🎯 Target Assistant ID:', ASSISTANT_IDS[targetAgent]);
        console.log('🔍 Target Agent Name:', targetAgent);
        console.log('✅ Expected: Mike (Sales) with ID:', ASSISTANT_IDS.sales);
        
        // Return transfer directive for VAPI
        return res.json(transferResponse);
        
    } catch (error) {
        console.error('❌ Transfer error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I apologize for the inconvenience. Let me try connecting you again."
            }]
        });
    }
}

// Handler to retrieve context for transferred calls
async function handleGetCallContext(args, res) {
    const { callId } = args;
    
    try {
        const context = await supabase.getCallContext(callId);
        
        if (context) {
            return res.json({
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "Context retrieved successfully",
                    data: context
                }]
            });
        } else {
            return res.json({
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "Starting fresh conversation",
                    data: null
                }]
            });
        }
    } catch (error) {
        console.error('❌ Context retrieval error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "Starting fresh conversation",
                data: null
            }]
        });
    }
}

module.exports = {
    handleTransferToAgent,
    handleGetCallContext,
    ASSISTANT_IDS
};