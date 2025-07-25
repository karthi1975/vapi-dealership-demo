// Agent Transfer Handler for VAPI Multi-Agent System

const supabase = require('../services/supabase');

// Assistant IDs mapping (replace with your actual VAPI assistant IDs)
const ASSISTANT_IDS = {
    leadQualifier: '1506a9d9-a0d5-4439-9d83-f447bcedda1e',
    sales: 'your-sales-assistant-id', // Replace with your Sales Agent assistant ID after creating it
    service: 'your-service-assistant-id',
    finance: 'your-finance-assistant-id',
    parts: 'your-parts-assistant-id',
    human: 'human-transfer' // Special case for human handoff
};

// Handler for transferToAgent tool
async function handleTransferToAgent(args, res) {
    const { targetAgent, context, callId } = args;
    
    console.log('🔄 Agent Transfer Request:', {
        from: 'current',
        to: targetAgent,
        callId: callId
    });
    
    try {
        // Validate target agent
        if (!ASSISTANT_IDS[targetAgent]) {
            return res.json({
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "I'm sorry, I couldn't find that department. Let me connect you with our main sales team."
                }],
                transfer: {
                    assistantId: ASSISTANT_IDS.sales
                }
            });
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
        
        // Get appropriate transfer message
        const transferMessages = {
            sales: "I'll transfer you to our sales specialist who can help you find the perfect vehicle.",
            service: "Let me connect you with our service department to schedule your appointment.",
            finance: "I'll transfer you to our finance expert who can discuss payment options with you.",
            parts: "Let me connect you with our parts department for availability and pricing."
        };
        
        // Return transfer directive for VAPI
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: transferMessages[targetAgent] || `Transferring you to our ${targetAgent} department.`
            }],
            // VAPI transfer configuration
            transfer: {
                assistantId: ASSISTANT_IDS[targetAgent],
                // Pass context to next assistant
                metadata: {
                    sessionId: callId,
                    previousAgent: context?.currentAgent || 'leadQualifier',
                    customerInfo: context?.customerInfo,
                    conversationSummary: context?.summary,
                    intent: context?.intent
                }
            }
        });
        
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