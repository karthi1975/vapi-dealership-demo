const express = require('express');
const router = express.Router();
// const supabaseEnhanced = require('../services/supabaseEnhanced'); // Disabled - not using Supabase
const googleSheets = require('../services/googleSheets');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

// Enhanced lead qualification with full vehicle data capture
async function handleEnhancedLeadQualification(args, res) {
    const { customerInfo, callId } = args;
    
    console.log('🔍 Enhanced lead qualification processing:', { customerInfo, callId });
    
    if (!customerInfo || !callId) {
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'd be happy to help you find the perfect vehicle! Could you please tell me what specific year, make, and model you're looking for?"
            }]
        });
    }
    
    // Validate email is present
    if (!customerInfo.email) {
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'll need your email address to send you the vehicle details and pricing information. What's the best email to reach you at?"
            }]
        });
    }
    
    try {
        // Create enhanced customer with all vehicle preferences
        const enhancedCustomerData = {
            phoneNumber: customerInfo.phoneNumber,
            name: customerInfo.name,
            email: customerInfo.email,
            budget: customerInfo.budget,
            preferredMake: customerInfo.preferredMake,
            preferredModel: customerInfo.preferredModel,
            preferredYear: customerInfo.preferredYear,
            minMileage: customerInfo.minMileage,
            maxMileage: customerInfo.maxMileage,
            priceRangeMin: customerInfo.priceRangeMin || (customerInfo.budget ? customerInfo.budget * 0.8 : null),
            priceRangeMax: customerInfo.priceRangeMax || (customerInfo.budget ? customerInfo.budget * 1.2 : null),
            vehicleType: customerInfo.vehicleType,
            timeline: customerInfo.timeline
        };
        
        const customer = await supabaseEnhanced.createEnhancedCustomer(enhancedCustomerData);
        
        // Log vehicle interest with inventory matching
        const interestResult = await supabaseEnhanced.logEnhancedVehicleInterest({
            callId: callId,
            customerId: customer?.id,
            year: customerInfo.preferredYear,
            make: customerInfo.preferredMake,
            model: customerInfo.preferredModel,
            minMileage: customerInfo.minMileage,
            maxMileage: customerInfo.maxMileage,
            priceRangeMin: enhancedCustomerData.priceRangeMin,
            priceRangeMax: enhancedCustomerData.priceRangeMax,
            stockNumber: customerInfo.stockNumber
        });
        
        // Generate inventory links if matches found
        let inventoryLink = null;
        if (interestResult && interestResult.matchedVehicles.length > 0) {
            const inventoryIds = interestResult.matchedVehicles.map(v => v.id);
            const linkData = await supabaseEnhanced.createShareableLink(
                callId,
                customer?.id,
                inventoryIds
            );
            inventoryLink = linkData?.full_url;
        }
        
        // Assign salesperson
        const salesperson = await assignSalesperson(callId, customer?.id);
        
        // Store initial transcript data
        await supabaseEnhanced.storeCallTranscript({
            callId: callId,
            customerId: customer?.id,
            transcript: { initial: customerInfo },
            summary: `Customer interested in ${customerInfo.preferredYear || ''} ${customerInfo.preferredMake || ''} ${customerInfo.preferredModel || ''}`,
            intentAnalysis: {
                intent: customerInfo.intent || 'browse',
                urgency: customerInfo.urgency || 'medium',
                budget: customerInfo.budget
            },
            leadScore: calculateEnhancedLeadScore(customerInfo),
            actionItems: generateActionItems(customerInfo),
            duration: 0
        });
        
        // Schedule follow-up communications
        await schedulePostCallCommunications(callId, customer, salesperson, inventoryLink, interestResult?.matchedVehicles);
        
        // Write to Google Sheets with enhanced data
        await googleSheets.appendLeadData({
            customerInfo: customerInfo,
            intent: customerInfo.intent || 'browse',
            summary: `${customerInfo.name} - ${customerInfo.preferredYear || ''} ${customerInfo.preferredMake || ''} ${customerInfo.preferredModel || ''} - Mileage: ${customerInfo.minMileage || 0}-${customerInfo.maxMileage || 'any'} - Budget: $${customerInfo.budget || 'N/A'}`,
            transferredTo: salesperson?.name || 'sales',
            callId: callId,
            inventoryLink: inventoryLink
        });
        
        // Prepare response
        let responseMessage = `Thank you ${customerInfo.name || ''}! `;
        
        if (interestResult && interestResult.matchedVehicles.length > 0) {
            responseMessage += `Great news! We have ${interestResult.matchedVehicles.length} ${customerInfo.preferredMake || 'vehicles'} that match your criteria. `;
            if (inventoryLink) {
                responseMessage += `I'll send you a link to view them shortly. `;
            }
        } else {
            responseMessage += `I'll help you find the perfect ${customerInfo.preferredYear || ''} ${customerInfo.preferredMake || 'vehicle'} ${customerInfo.preferredModel || ''}. `;
        }
        
        responseMessage += `${salesperson?.name || 'Our sales specialist'} will be assisting you today!`;
        
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: responseMessage,
                metadata: {
                    matchedVehicles: interestResult?.matchedVehicles?.length || 0,
                    inventoryLink: inventoryLink,
                    salesperson: salesperson
                }
            }]
        });
        
    } catch (error) {
        console.error('❌ Enhanced lead qualification error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "I'd be happy to help you find the perfect vehicle!"
            }]
        });
    }
}

// Calculate enhanced lead score
function calculateEnhancedLeadScore(customerInfo) {
    let score = 0;
    
    // Budget scoring (30 points)
    const budget = customerInfo.budget || 0;
    if (budget >= 50000) score += 30;
    else if (budget >= 35000) score += 25;
    else if (budget >= 25000) score += 20;
    else if (budget >= 15000) score += 15;
    else if (budget > 0) score += 10;
    
    // Timeline scoring (25 points)
    const timeline = customerInfo.timeline?.toLowerCase() || '';
    if (timeline.includes('today') || timeline.includes('now') || timeline.includes('immediate')) score += 25;
    else if (timeline.includes('week') || timeline.includes('soon')) score += 20;
    else if (timeline.includes('month')) score += 15;
    else if (timeline.includes('quarter')) score += 10;
    
    // Intent scoring (20 points)
    if (customerInfo.intent === 'buy') score += 20;
    else if (customerInfo.intent === 'finance') score += 15;
    else if (customerInfo.intent === 'test_drive') score += 10;
    else if (customerInfo.intent === 'browse') score += 5;
    
    // Specific vehicle interest (15 points)
    if (customerInfo.stockNumber) score += 15;
    else if (customerInfo.preferredYear && customerInfo.preferredMake && customerInfo.preferredModel) score += 12;
    else if (customerInfo.preferredMake && customerInfo.preferredModel) score += 10;
    else if (customerInfo.preferredMake || customerInfo.vehicleType) score += 5;
    
    // Contact information completeness (10 points)
    if (customerInfo.email && customerInfo.phoneNumber) score += 10;
    else if (customerInfo.phoneNumber) score += 7;
    else if (customerInfo.email) score += 5;
    
    return Math.min(score, 100);
}

// Generate action items based on customer data
function generateActionItems(customerInfo) {
    const actionItems = [];
    
    if (customerInfo.intent === 'buy' || customerInfo.timeline?.includes('today')) {
        actionItems.push('Priority follow-up - customer ready to buy');
    }
    
    if (customerInfo.stockNumber) {
        actionItems.push(`Check availability of stock #${customerInfo.stockNumber}`);
    }
    
    if (customerInfo.budget && customerInfo.budget > 40000) {
        actionItems.push('Discuss financing options and warranties');
    }
    
    if (customerInfo.preferredMake && customerInfo.preferredModel) {
        actionItems.push(`Show all ${customerInfo.preferredMake} ${customerInfo.preferredModel} options`);
    }
    
    if (customerInfo.intent === 'test_drive') {
        actionItems.push('Schedule test drive appointment');
    }
    
    if (!customerInfo.email) {
        actionItems.push('Collect email address for follow-up');
    }
    
    return actionItems;
}

// Assign salesperson based on availability and expertise
async function assignSalesperson(callId, customerId) {
    // In a real implementation, this would check salesperson availability
    // and match based on expertise with the requested vehicle type
    
    const salespeople = [
        {
            name: 'John Smith',
            email: 'john.smith@dealership.com',
            phone: '+1-555-0123',
            expertise: ['Toyota', 'Honda', 'Nissan']
        },
        {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@dealership.com',
            phone: '+1-555-0124',
            expertise: ['Mercedes-Benz', 'BMW', 'Audi']
        },
        {
            name: 'Mike Wilson',
            email: 'mike.wilson@dealership.com',
            phone: '+1-555-0125',
            expertise: ['Ford', 'Chevrolet', 'GMC']
        }
    ];
    
    // For demo, randomly assign
    const assigned = salespeople[Math.floor(Math.random() * salespeople.length)];
    
    await supabaseEnhanced.assignSalesperson({
        callId: callId,
        customerId: customerId,
        salespersonName: assigned.name,
        salespersonEmail: assigned.email,
        salespersonPhone: assigned.phone
    });
    
    return assigned;
}

// Schedule post-call communications
async function schedulePostCallCommunications(callId, customer, salesperson, inventoryLink, matchedVehicles) {
    const now = new Date();
    
    // 1. Immediate SMS with inventory link (if available)
    if (inventoryLink && customer?.phone_number) {
        await supabaseEnhanced.scheduleCommunication({
            callId: callId,
            customerId: customer.id,
            type: 'sms',
            subject: 'Your Vehicle Matches',
            content: `Hi ${customer.name}, here are your matched vehicles: ${inventoryLink}\n\n${salesperson.name} will follow up shortly.\n${salesperson.phone}`,
            scheduledAt: now.toISOString(),
            metadata: { inventoryLink, vehicleCount: matchedVehicles?.length || 0 }
        });
    }
    
    // 2. Client summary email (15-30 min delay) - Only if email exists
    if (customer?.email) {
        const emailDelay = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes
        await supabaseEnhanced.scheduleCommunication({
            callId: callId,
            customerId: customer.id,
            type: 'email',
            subject: `Your Vehicle Search Results - ${customer.preferred_make || 'Multiple'} Options Available`,
            content: generateClientEmailContent(customer, salesperson, inventoryLink, matchedVehicles),
            scheduledAt: emailDelay.toISOString(),
            metadata: { 
                template: 'client_summary',
                salesperson: salesperson,
                matchedVehicles: matchedVehicles?.map(v => ({
                    stock: v.stock_number,
                    year: v.year,
                    make: v.make,
                    model: v.model,
                    price: v.price
                }))
            }
        });
        
        console.log(`📧 Email scheduled for ${customer.email} at ${emailDelay.toISOString()}`);
    } else {
        console.log('⚠️ No email provided - skipping email scheduling');
    }
    
    // 3. Schedule education campaign emails
    const campaigns = await supabaseEnhanced.getEducationCampaigns('buyer_tips');
    for (const campaign of campaigns) {
        const campaignDate = new Date(now.getTime() + campaign.delay_days * 24 * 60 * 60 * 1000);
        await supabaseEnhanced.scheduleCommunication({
            callId: callId,
            customerId: customer.id,
            type: 'education',
            subject: campaign.subject,
            content: campaign.content,
            scheduledAt: campaignDate.toISOString(),
            metadata: { 
                campaign: campaign.name,
                sequence: campaign.sequence_order
            }
        });
    }
}

// Generate client email content
function generateClientEmailContent(customer, salesperson, inventoryLink, matchedVehicles) {
    let content = `
Dear ${customer.name || 'Valued Customer'},

Thank you for your interest in finding the perfect vehicle with us today!

**Your Assigned Sales Specialist:**
${salesperson.name}
📧 ${salesperson.email}
📱 ${salesperson.phone}

**Your Vehicle Preferences:**
- ${customer.preferred_year || 'Any Year'} ${customer.preferred_make || 'Any Make'} ${customer.preferred_model || 'Any Model'}
- Budget: $${customer.budget ? customer.budget.toLocaleString() : 'Flexible'}
- Mileage Range: ${customer.min_mileage || 0} - ${customer.max_mileage || 'Any'} miles
`;

    if (matchedVehicles && matchedVehicles.length > 0) {
        content += `\n**Matched Vehicles (${matchedVehicles.length} found):**\n`;
        matchedVehicles.slice(0, 5).forEach(vehicle => {
            content += `- ${vehicle.year} ${vehicle.make} ${vehicle.model} - $${vehicle.price.toLocaleString()} - ${vehicle.mileage.toLocaleString()} miles (Stock #${vehicle.stock_number})\n`;
        });
        
        if (inventoryLink) {
            content += `\n[View All Matches](${inventoryLink})\n`;
        }
    }

    content += `
**Next Steps:**
1. ${salesperson.name} will contact you within the next hour to discuss your options
2. Feel free to browse the inventory link above
3. Reply to this email with any questions or specific requirements

We look forward to helping you find your perfect vehicle!

Best regards,
The Dealership Team
`;

    return content;
}

// Enhanced inventory search with link generation
async function handleEnhancedInventorySearch(args, res) {
    const { criteria, callId, customerId } = args;
    
    try {
        const matches = await supabaseEnhanced.searchInventory({
            year: criteria.year,
            make: criteria.make,
            model: criteria.model,
            stockNumber: criteria.stockNumber,
            minMileage: criteria.minMileage,
            maxMileage: criteria.maxMileage,
            priceMin: criteria.priceMin,
            priceMax: criteria.priceMax
        });
        
        let response = {
            toolCallId: args.toolCallId || 'default',
            result: `I found ${matches.length} vehicles that match your criteria.`,
            vehicles: []
        };
        
        if (matches.length > 0) {
            // Create shareable link
            const inventoryIds = matches.map(v => v.id);
            const link = await supabaseEnhanced.createShareableLink(callId, customerId, inventoryIds);
            
            response.result += ` Here are the top options:`;
            response.inventoryLink = link?.full_url;
            
            // Include top 3 matches in response
            response.vehicles = matches.slice(0, 3).map(v => ({
                stockNumber: v.stock_number,
                description: `${v.year} ${v.make} ${v.model} ${v.trim_level || ''}`,
                price: `$${v.price.toLocaleString()}`,
                mileage: `${v.mileage.toLocaleString()} miles`,
                color: v.color,
                features: v.features?.slice(0, 3)
            }));
            
            if (link?.full_url) {
                response.result += ` I'll send you a link to view all ${matches.length} options.`;
            }
        } else {
            response.result += ` Would you like me to expand the search criteria?`;
        }
        
        return res.json({ results: [response] });
        
    } catch (error) {
        console.error('❌ Inventory search error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "Let me search our inventory for you."
            }]
        });
    }
}

// Update transcript with full conversation
async function handleTranscriptUpdate(args, res) {
    const { callId, transcript, summary } = args;
    
    try {
        await supabaseEnhanced.storeCallTranscript({
            callId: callId,
            customerId: args.customerId,
            transcript: transcript,
            summary: summary,
            intentAnalysis: args.intentAnalysis,
            leadScore: args.leadScore,
            actionItems: args.actionItems,
            duration: args.duration
        });
        
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "Transcript updated successfully"
            }]
        });
    } catch (error) {
        console.error('❌ Transcript update error:', error);
        return res.json({
            results: [{
                toolCallId: args.toolCallId || 'default',
                result: "Failed to update transcript"
            }]
        });
    }
}

// Export routes
router.post('/enhanced-lead-qualification', (req, res) => {
    const args = req.body.parameters || req.body;
    return handleEnhancedLeadQualification(args, res);
});

router.post('/enhanced-inventory-search', (req, res) => {
    const args = req.body.parameters || req.body;
    return handleEnhancedInventorySearch(args, res);
});

router.post('/update-transcript', (req, res) => {
    const args = req.body.parameters || req.body;
    return handleTranscriptUpdate(args, res);
});

module.exports = {
    router,
    handleEnhancedLeadQualification,
    handleEnhancedInventorySearch,
    handleTranscriptUpdate
};