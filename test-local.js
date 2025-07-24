const http = require('http');

console.log('🧪 Testing local server endpoints...\n');

// Function to make HTTP request
function testEndpoint(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ ${options.method} ${options.path}: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log(`   Response: ${JSON.stringify(json).substring(0, 150)}...\n`);
                    resolve(json);
                } catch {
                    console.log(`   Response: ${data.substring(0, 150)}...\n`);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ ${options.method} ${options.path}: ${error.message}\n`);
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Test all endpoints
async function runTests() {
    const baseOptions = {
        hostname: 'localhost',
        port: 3000,
        headers: { 'Content-Type': 'application/json' }
    };

    // Test GET endpoints
    await testEndpoint({ ...baseOptions, method: 'GET', path: '/' });
    await testEndpoint({ ...baseOptions, method: 'GET', path: '/health' });
    await testEndpoint({ ...baseOptions, method: 'GET', path: '/vapi/config' });
    await testEndpoint({ ...baseOptions, method: 'GET', path: '/api/inventory' });
    await testEndpoint({ ...baseOptions, method: 'GET', path: '/api/dashboard' });

    // Test POST endpoints
    await testEndpoint(
        { ...baseOptions, method: 'POST', path: '/vapi/webhook' },
        JSON.stringify({ event: 'test', call: { id: 'test123' } })
    );
    
    await testEndpoint(
        { ...baseOptions, method: 'POST', path: '/vapi/function/checkInventory' },
        JSON.stringify({ make: 'Toyota' })
    );
    
    await testEndpoint(
        { ...baseOptions, method: 'POST', path: '/vapi/function/transferToHuman' },
        JSON.stringify({ reason: 'customer request' })
    );

    console.log('✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);