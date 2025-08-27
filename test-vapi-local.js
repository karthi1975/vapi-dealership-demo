// Test VAPI tool calls locally
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Test leadQualification with transcript
async function testLeadQualificationWithTranscript() {
    console.log('🧪 Testing leadQualification with transcript...\n');
    
    const testRequest = {
        message: {
            type: 'tool-calls',
            toolCalls: [{
                id: 'test-tool-call-123',
                function: {
                    name: 'leadQualification',
                    arguments: {
                        customerInfo: {
                            name: 'Test Customer',
                            phoneNumber: '+1234567890',
                            email: 'test@example.com',
                            budget: 35000,
                            timeline: 'This week',
                            urgency: 'high',
                            intent: 'buy',
                            preferredMake: 'Toyota',
                            preferredModel: 'Camry',
                            vehicleType: 'sedan'
                        },
                        callId: 'TEST-CALL-123'
                    }
                }
            }],
            // Add messages array to simulate conversation
            messages: [
                { role: 'assistant', content: 'Hello! Welcome to Valley Motors. How can I help you today?' },
                { role: 'user', content: 'Hi, I am looking for a Toyota Camry' },
                { role: 'assistant', content: 'Great choice! What is your budget?' },
                { role: 'user', content: 'Around 35000 dollars' },
                { role: 'assistant', content: 'Perfect! When are you looking to purchase?' },
                { role: 'user', content: 'This week if possible' }
            ]
        }
    };
    
    try {
        const response = await axios.post(`${BASE_URL}/vapi-tools`, testRequest, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Response received:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test call-ended webhook
async function testCallEndedWebhook() {
    console.log('\n🧪 Testing call-ended webhook...\n');
    
    const testWebhook = {
        event: 'call-ended',
        call: {
            id: 'webhook-test-call-456',
            duration: 180,
            customer: {
                name: 'Webhook Test Customer',
                number: '+9876543210'
            },
            transcript: 'Assistant: Hello, how can I help?\nCustomer: I need a car.\nAssistant: What kind of car?\nCustomer: A sedan.\nAssistant: Great, let me help you.',
            messages: [
                { role: 'assistant', content: 'Hello, how can I help?' },
                { role: 'customer', content: 'I need a car.' },
                { role: 'assistant', content: 'What kind of car?' },
                { role: 'customer', content: 'A sedan.' },
                { role: 'assistant', content: 'Great, let me help you.' }
            ]
        }
    };
    
    try {
        const response = await axios.post(`${BASE_URL}/vapi/webhook`, testWebhook, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Webhook response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting VAPI local tests...\n');
    console.log('Make sure the server is running on port', PORT);
    console.log('===============================================\n');
    
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLeadQualificationWithTranscript();
    await testCallEndedWebhook();
    
    console.log('\n✅ Tests complete! Check your Google Sheets.');
}

runTests().catch(console.error);