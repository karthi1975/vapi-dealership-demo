require('dotenv').config();
const googleSheets = require('./src/services/googleSheets');

async function testTranscript() {
    console.log('🔍 Testing Google Sheets with conversation transcript...\n');
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test data with conversation transcript
    const testData = {
        customerInfo: {
            name: 'John Doe',
            phoneNumber: '+1234567890',
            intent: 'buy',
            preferredMake: 'Toyota',
            preferredModel: 'Camry',
            budget: 35000,
            timeline: 'This week',
            urgency: 'high'
        },
        callDuration: '5:45',
        outcome: 'Transferred to Sales',
        summary: 'Customer interested in Toyota Camry, ready to buy this week',
        transcript: `Agent: Hello! Welcome to Valley Motors. How can I help you today?
Customer: Hi, I'm looking for a new Toyota Camry.
Agent: Great choice! Are you looking to purchase or lease?
Customer: I want to purchase. My budget is around $35,000.
Agent: Perfect! We have several Camry models in stock within your budget. When were you hoping to make a purchase?
Customer: This week if possible. I need a car soon.
Agent: Excellent! Let me transfer you to our sales specialist who can help you with available inventory and schedule a test drive.
Customer: That sounds great, thank you!
Agent: You're welcome! Transferring you now...`,
        callId: 'test-call-123'
    };
    
    try {
        const result = await googleSheets.appendLeadData(testData);
        
        if (result) {
            console.log('✅ Successfully wrote test data with transcript to Google Sheets!');
            console.log('   Row added:', result.updatedRange);
            console.log('\n📊 Check your Google Sheet - Column J should contain the conversation transcript');
            console.log('   Sheet URL: https://docs.google.com/spreadsheets/d/1rcTY673C9dQlRoEqHJxDX0BnoKY1NURnKuJlsvCAxhA');
        } else {
            console.log('❌ Failed to write to Google Sheets');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testTranscript().catch(console.error);