// Sales Agent Tool Handlers for VAPI

// const supabase = require('../services/supabase'); // Disabled - not using Supabase

// Mock inventory data (replace with real database queries)
const mockInventory = [
    {
        id: "INV001",
        vin: "1HGCM82633A123456",
        make: "Honda",
        model: "Accord",
        year: 2024,
        type: "sedan",
        color: "Pearl White",
        price: 28500,
        mileage: 15,
        features: ["leather seats", "sunroof", "apple carplay", "lane keeping assist"],
        status: "available",
        images: ["https://example.com/accord1.jpg"],
        mpg: { city: 32, highway: 42 }
    },
    {
        id: "INV002",
        vin: "5XYZU3LB8JG123456",
        make: "Hyundai",
        model: "Santa Fe",
        year: 2024,
        type: "suv",
        color: "Calypso Red",
        price: 34900,
        mileage: 8,
        features: ["awd", "3rd row seating", "panoramic sunroof", "blind spot monitoring"],
        status: "available",
        images: ["https://example.com/santafe1.jpg"],
        mpg: { city: 25, highway: 31 }
    },
    {
        id: "INV003",
        vin: "1FTFW1ET5DFC12345",
        make: "Ford",
        model: "F-150",
        year: 2023,
        type: "truck",
        color: "Velocity Blue",
        price: 45500,
        mileage: 5200,
        features: ["4wd", "crew cab", "towing package", "bed liner", "apple carplay"],
        status: "available",
        images: ["https://example.com/f150.jpg"],
        mpg: { city: 20, highway: 27 }
    },
    {
        id: "INV004",
        vin: "JTEBU5JR8K5123456",
        make: "Toyota",
        model: "4Runner",
        year: 2024,
        type: "suv",
        color: "Army Green",
        price: 42800,
        mileage: 120,
        features: ["4wd", "crawl control", "leather seats", "jbl audio", "sunroof"],
        status: "available",
        images: ["https://example.com/4runner.jpg"],
        mpg: { city: 17, highway: 21 }
    }
];

// Handler for checkInventory
async function handleCheckInventory(args, res) {
    const { vehicleType, make, model, yearRange, priceRange, features } = args;
    
    console.log('🚗 Checking inventory with criteria:', args);
    
    try {
        // Filter inventory based on criteria
        let results = mockInventory.filter(vehicle => {
            // Type filter
            if (vehicleType && vehicle.type !== vehicleType) return false;
            
            // Make filter
            if (make && vehicle.make.toLowerCase() !== make.toLowerCase()) return false;
            
            // Model filter
            if (model && vehicle.model.toLowerCase() !== model.toLowerCase()) return false;
            
            // Year range filter
            if (yearRange) {
                if (yearRange.min && vehicle.year < yearRange.min) return false;
                if (yearRange.max && vehicle.year > yearRange.max) return false;
            }
            
            // Price range filter
            if (priceRange) {
                if (priceRange.min && vehicle.price < priceRange.min) return false;
                if (priceRange.max && vehicle.price > priceRange.max) return false;
            }
            
            // Features filter
            if (features && features.length > 0) {
                const hasAllFeatures = features.every(feature => 
                    vehicle.features.some(vFeature => 
                        vFeature.toLowerCase().includes(feature.toLowerCase())
                    )
                );
                if (!hasAllFeatures) return false;
            }
            
            return true;
        });
        
        // Format response
        const response = {
            toolCallId: args.toolCallId || 'default',
            result: results.length > 0 
                ? `I found ${results.length} vehicle${results.length > 1 ? 's' : ''} matching your criteria:\n\n${
                    results.map((v, i) => 
                        `${i + 1}. ${v.year} ${v.make} ${v.model} - ${v.color}\n` +
                        `   Price: $${v.price.toLocaleString()} | Mileage: ${v.mileage.toLocaleString()} miles\n` +
                        `   Key features: ${v.features.slice(0, 3).join(', ')}\n` +
                        `   MPG: ${v.mpg.city} city / ${v.mpg.highway} highway`
                    ).join('\n\n')
                  }`
                : "I couldn't find any vehicles matching those exact criteria. Would you like me to broaden the search or show you similar options?",
            data: {
                count: results.length,
                vehicles: results
            }
        };
        
        return res.json({ results: [response] });
        
    } catch (error) {
        console.error('❌ Inventory check error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'm having trouble accessing our inventory right now. Let me get someone to help you.",
                error: true
            }]
        });
    }
}

// Handler for getVehicleDetails
async function handleGetVehicleDetails(args, res) {
    const { vehicleId } = args;
    
    console.log('🔍 Getting details for vehicle:', vehicleId);
    
    try {
        const vehicle = mockInventory.find(v => v.id === vehicleId || v.vin === vehicleId);
        
        if (!vehicle) {
            return res.json({
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "I couldn't find that specific vehicle. Could you provide the correct ID or would you like me to search for similar vehicles?"
                }]
            });
        }
        
        const detailedInfo = `Here are the complete details for the ${vehicle.year} ${vehicle.make} ${vehicle.model}:

**Specifications:**
- Color: ${vehicle.color}
- Mileage: ${vehicle.mileage.toLocaleString()} miles
- VIN: ${vehicle.vin}
- Type: ${vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}

**Pricing:**
- List Price: $${vehicle.price.toLocaleString()}
- Estimated Monthly: $${Math.round(vehicle.price * 0.9 / 60).toLocaleString()} (60 months, 10% down)

**Fuel Economy:**
- City: ${vehicle.mpg.city} MPG
- Highway: ${vehicle.mpg.highway} MPG

**Features:**
${vehicle.features.map(f => `- ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

This vehicle is currently ${vehicle.status} and ready for a test drive. Would you like to schedule one?`;
        
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: detailedInfo,
                data: vehicle
            }]
        });
        
    } catch (error) {
        console.error('❌ Vehicle details error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'm having trouble retrieving those details. Let me connect you with someone who can help.",
                error: true
            }]
        });
    }
}

// Handler for scheduleTestDrive
async function handleScheduleTestDrive(args, res) {
    const { vehicleId, customerName, customerPhone, preferredDate, preferredTime } = args;
    
    console.log('📅 Scheduling test drive:', args);
    
    try {
        // Find the vehicle
        const vehicle = mockInventory.find(v => v.id === vehicleId || v.vin === vehicleId);
        
        if (!vehicle) {
            return res.json({
                results: [{
                    toolCallId: args.toolCallId || 'default',
                    result: "I couldn't find that vehicle for the test drive. Let me help you find the right one."
                }]
            });
        }
        
        // Create appointment (in real app, save to database)
        const appointment = {
            id: `TD${Date.now()}`,
            vehicleId: vehicle.id,
            vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            customerName,
            customerPhone,
            date: preferredDate,
            time: preferredTime || "at your convenience",
            status: "confirmed",
            createdAt: new Date().toISOString()
        };
        
        // Log the appointment
        await supabase.logTestDrive(appointment);
        
        const confirmationMessage = `Perfect! I've scheduled your test drive:

**Appointment Details:**
- Vehicle: ${appointment.vehicleInfo} (${vehicle.color})
- Date: ${preferredDate}
- Time: ${preferredTime || "We'll call to confirm the best time"}
- Confirmation #: ${appointment.id}

I'll send you a text confirmation to ${customerPhone}. Please bring your driver's license and proof of insurance. 

Is there anything specific about the ${vehicle.model} you'd like me to highlight during the test drive?`;
        
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: confirmationMessage,
                data: appointment
            }]
        });
        
    } catch (error) {
        console.error('❌ Test drive scheduling error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'm having trouble scheduling that right now. Let me transfer you to someone who can help set up your test drive.",
                error: true
            }]
        });
    }
}

// Handler for calculatePayment
async function handleCalculatePayment(args, res) {
    const { vehiclePrice, downPayment = 0, tradeInValue = 0, loanTerm = 60, creditScore = "good" } = args;
    
    console.log('💰 Calculating payment:', args);
    
    try {
        // Interest rates based on credit score
        const rates = {
            excellent: 0.0299,
            good: 0.0449,
            fair: 0.0649,
            poor: 0.0899
        };
        
        const interestRate = rates[creditScore] || rates.good;
        const monthlyRate = interestRate / 12;
        
        // Calculate loan amount
        const loanAmount = vehiclePrice - downPayment - tradeInValue;
        
        // Calculate monthly payment
        const monthlyPayment = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
            (Math.pow(1 + monthlyRate, loanTerm) - 1);
        
        // Calculate total interest
        const totalPayments = monthlyPayment * loanTerm;
        const totalInterest = totalPayments - loanAmount;
        
        const response = `Based on your information, here's your payment estimate:

**Loan Details:**
- Vehicle Price: $${vehiclePrice.toLocaleString()}
- Down Payment: $${downPayment.toLocaleString()}
- Trade-in Value: $${tradeInValue.toLocaleString()}
- Loan Amount: $${loanAmount.toLocaleString()}

**Monthly Payment: $${Math.round(monthlyPayment).toLocaleString()}**
- Term: ${loanTerm} months
- Interest Rate: ${(interestRate * 100).toFixed(2)}% APR (${creditScore} credit)
- Total Interest: $${Math.round(totalInterest).toLocaleString()}

This is an estimate. Your actual rate may vary based on credit approval. Would you like to explore different down payment options or loan terms?`;
        
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: response,
                data: {
                    monthlyPayment: Math.round(monthlyPayment),
                    loanAmount,
                    interestRate: interestRate * 100,
                    totalInterest: Math.round(totalInterest)
                }
            }]
        });
        
    } catch (error) {
        console.error('❌ Payment calculation error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'm having trouble calculating that payment. Let me connect you with our finance team for accurate numbers.",
                error: true
            }]
        });
    }
}

module.exports = {
    handleCheckInventory,
    handleGetVehicleDetails,
    handleScheduleTestDrive,
    handleCalculatePayment
};