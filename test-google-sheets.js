require('dotenv').config();
const googleSheets = require('./src/services/googleSheets');

async function testGoogleSheets() {
    console.log('🔍 Testing Google Sheets connection...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables Check:');
    console.log('GOOGLE_SHEETS_CREDENTIALS:', process.env.GOOGLE_SHEETS_CREDENTIALS ? '✅ Set' : '❌ Missing');
    console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? '✅ Set' : '❌ Missing');
    
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.SPREADSHEET_ID) {
        console.error('\n❌ Missing required environment variables!');
        console.log('\n📝 Make sure to set in Railway dashboard:');
        console.log('   - GOOGLE_SHEETS_CREDENTIALS');
        console.log('   - SPREADSHEET_ID');
        return;
    }
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test writing data
    console.log('\n📝 Testing data write to Google Sheets...');
    
    const testData = {
        customerInfo: {
            name: 'Test Customer',
            phoneNumber: '+1234567890',
            intent: 'buy',
            preferredMake: 'Toyota',
            preferredModel: 'Camry',
            budget: 30000,
            timeline: 'This week',
            urgency: 'high'
        },
        callDuration: '2:30',
        outcome: 'Test Entry',
        summary: 'This is a test entry to verify Google Sheets is working'
    };
    
    try {
        const result = await googleSheets.appendLeadData(testData);
        
        if (result) {
            console.log('✅ Successfully wrote test data to Google Sheets!');
            console.log('   Updates:', result.updates);
            console.log('\n🎉 Google Sheets integration is working correctly!');
        } else {
            console.log('❌ Failed to write to Google Sheets (no error thrown)');
        }
    } catch (error) {
        console.error('❌ Error writing to Google Sheets:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Verify the service account has access to the spreadsheet');
        console.log('   2. Check that the spreadsheet ID is correct');
        console.log('   3. Ensure the credentials JSON is properly formatted');
    }
}

testGoogleSheets().catch(console.error);