const express = require('express');
const router = express.Router();
const supabaseEnhanced = require('../services/supabaseEnhanced');
const emailService = require('../services/emailService');

// Display inventory from shared link
router.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    
    try {
        // Track link click
        await supabaseEnhanced.trackLinkClick(shortCode);
        
        // Get link data
        const { data: link, error: linkError } = await supabaseEnhanced.client
            .from('shared_links')
            .select('*, customers(*)')
            .eq('short_code', shortCode)
            .single();
        
        if (linkError || !link) {
            return res.status(404).send(generate404Page());
        }
        
        // Check if link is expired
        if (link.expires_at && new Date(link.expires_at) < new Date()) {
            return res.status(410).send(generateExpiredPage());
        }
        
        // Get inventory items
        const { data: vehicles, error: inventoryError } = await supabaseEnhanced.client
            .from('inventory')
            .select('*')
            .in('id', link.inventory_ids)
            .order('price', { ascending: true });
        
        if (inventoryError) {
            console.error('Error fetching inventory:', inventoryError);
            return res.status(500).send(generateErrorPage());
        }
        
        // Get sales assignment
        const { data: assignment } = await supabaseEnhanced.client
            .from('sales_assignments')
            .select('*')
            .eq('call_id', link.call_id)
            .single();
        
        // Generate and send HTML page
        const html = generateInventoryPage({
            vehicles: vehicles || [],
            customer: link.customers,
            salesperson: assignment,
            shortCode: shortCode
        });
        
        res.send(html);
        
    } catch (error) {
        console.error('Error displaying inventory:', error);
        res.status(500).send(generateErrorPage());
    }
});

// Contact form submission
router.post('/:shortCode/contact', async (req, res) => {
    const { shortCode } = req.params;
    const { message, vehicleId, contactMethod } = req.body;
    
    try {
        // Get link and customer data
        const { data: link } = await supabaseEnhanced.client
            .from('shared_links')
            .select('*, customers(*)')
            .eq('short_code', shortCode)
            .single();
        
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }
        
        // Get vehicle details if specified
        let vehicleDetails = '';
        if (vehicleId) {
            const { data: vehicle } = await supabaseEnhanced.client
                .from('inventory')
                .select('*')
                .eq('id', vehicleId)
                .single();
            
            if (vehicle) {
                vehicleDetails = `\n\nRegarding: ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stock_number})`;
            }
        }
        
        // Get sales assignment
        const { data: assignment } = await supabaseEnhanced.client
            .from('sales_assignments')
            .select('*')
            .eq('call_id', link.call_id)
            .single();
        
        // Schedule immediate follow-up
        const followUpContent = `
Customer ${link.customers.name} has submitted a contact request from their inventory link.

Contact Method Preferred: ${contactMethod}
Phone: ${link.customers.phone_number}
Email: ${link.customers.email || 'Not provided'}

Message: ${message}${vehicleDetails}

Please follow up immediately.
        `;
        
        // Send to salesperson
        if (assignment && assignment.salesperson_email) {
            await emailService.sendEmail(
                assignment.salesperson_email,
                `Urgent: Customer Contact Request - ${link.customers.name}`,
                followUpContent
            );
        }
        
        res.json({ success: true, message: 'Your message has been sent!' });
        
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// HTML generation functions
function generateInventoryPage({ vehicles, customer, salesperson, shortCode }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Vehicle Matches - ${customer?.name || 'Dealership'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 2rem 1rem;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .salesperson-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #3498db;
        }
        
        .salesperson-card h2 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-top: 1rem;
        }
        
        .contact-info div {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .contact-info a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        
        .contact-info a:hover {
            text-decoration: underline;
        }
        
        .vehicles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .vehicle-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .vehicle-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .vehicle-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 1.2rem;
        }
        
        .vehicle-details {
            padding: 1.5rem;
        }
        
        .vehicle-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        
        .vehicle-subtitle {
            color: #666;
            margin-bottom: 1rem;
            font-size: 0.95rem;
        }
        
        .vehicle-price {
            font-size: 1.8rem;
            font-weight: 700;
            color: #27ae60;
            margin-bottom: 1rem;
        }
        
        .vehicle-features {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .feature-tag {
            background: #ecf0f1;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.85rem;
            color: #555;
        }
        
        .vehicle-specs {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
            margin-bottom: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #ecf0f1;
        }
        
        .spec-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
            font-size: 0.9rem;
        }
        
        .cta-button {
            background: #3498db;
            color: white;
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s ease;
        }
        
        .cta-button:hover {
            background: #2980b9;
        }
        
        .contact-form {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 3rem;
        }
        
        .contact-form h2 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }
        
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            font-family: inherit;
        }
        
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #3498db;
        }
        
        .radio-group {
            display: flex;
            gap: 2rem;
            margin-top: 0.5rem;
        }
        
        .radio-group label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: none;
        }
        
        .footer {
            text-align: center;
            padding: 2rem 1rem;
            color: #666;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.5rem;
            }
            
            .vehicles-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .vehicle-specs {
                grid-template-columns: 1fr;
            }
            
            .contact-info {
                flex-direction: column;
                gap: 1rem;
            }
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Personalized Vehicle Matches</h1>
        <p>Hello ${customer?.name || 'Valued Customer'}! Here are the vehicles we found for you.</p>
    </div>
    
    <div class="container">
        ${salesperson ? `
        <div class="salesperson-card">
            <h2>Your Dedicated Sales Specialist</h2>
            <p><strong>${salesperson.salesperson_name}</strong> is here to help you find the perfect vehicle.</p>
            <div class="contact-info">
                <div>
                    📱 <a href="tel:${salesperson.salesperson_phone}">${salesperson.salesperson_phone}</a>
                </div>
                <div>
                    ✉️ <a href="mailto:${salesperson.salesperson_email}">${salesperson.salesperson_email}</a>
                </div>
            </div>
        </div>
        ` : ''}
        
        <h2 style="margin-bottom: 2rem; color: #2c3e50;">
            ${vehicles.length} Vehicles Match Your Criteria
        </h2>
        
        <div class="vehicles-grid">
            ${vehicles.map(vehicle => `
                <div class="vehicle-card">
                    <div class="vehicle-image">
                        <span>🚗 ${vehicle.color || 'Vehicle'} ${vehicle.body_type || ''}</span>
                    </div>
                    <div class="vehicle-details">
                        <h3 class="vehicle-title">${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                        <p class="vehicle-subtitle">${vehicle.trim_level || ''} - Stock #${vehicle.stock_number}</p>
                        <div class="vehicle-price">$${vehicle.price.toLocaleString()}</div>
                        
                        <div class="vehicle-specs">
                            <div class="spec-item">
                                📏 ${vehicle.mileage.toLocaleString()} miles
                            </div>
                            <div class="spec-item">
                                🎨 ${vehicle.color || 'N/A'}
                            </div>
                            <div class="spec-item">
                                ⚙️ ${vehicle.condition}
                            </div>
                            <div class="spec-item">
                                🏷️ ${vehicle.vin}
                            </div>
                        </div>
                        
                        ${vehicle.features && vehicle.features.length > 0 ? `
                        <div class="vehicle-features">
                            ${vehicle.features.slice(0, 3).map(feature => 
                                `<span class="feature-tag">${feature}</span>`
                            ).join('')}
                        </div>
                        ` : ''}
                        
                        <button class="cta-button" onclick="selectVehicle('${vehicle.id}', '${vehicle.year} ${vehicle.make} ${vehicle.model}')">
                            I'm Interested in This Vehicle
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="contact-form" id="contactForm">
            <h2>Ready to Take the Next Step?</h2>
            <div class="success-message" id="successMessage">
                ✅ Your message has been sent! We'll contact you shortly.
            </div>
            <form onsubmit="submitContact(event)">
                <div class="form-group">
                    <label for="vehicle">Vehicle of Interest (Optional)</label>
                    <select id="vehicle" name="vehicleId">
                        <option value="">General Inquiry</option>
                        ${vehicles.map(vehicle => 
                            `<option value="${vehicle.id}">${vehicle.year} ${vehicle.make} ${vehicle.model} - $${vehicle.price.toLocaleString()}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="message">Your Message</label>
                    <textarea id="message" name="message" rows="4" required 
                        placeholder="I'd like to schedule a test drive, get more information, or discuss financing options..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Preferred Contact Method</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="contactMethod" value="phone" checked>
                            <span>Phone Call</span>
                        </label>
                        <label>
                            <input type="radio" name="contactMethod" value="email">
                            <span>Email</span>
                        </label>
                        <label>
                            <input type="radio" name="contactMethod" value="text">
                            <span>Text Message</span>
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="cta-button">Send Message</button>
            </form>
        </div>
    </div>
    
    <div class="footer">
        <p>This personalized link was created just for you.</p>
        <p>© 2024 Your Dealership. All rights reserved.</p>
    </div>
    
    <script>
        function selectVehicle(vehicleId, vehicleName) {
            document.getElementById('vehicle').value = vehicleId;
            document.getElementById('message').value = \`I'm interested in the \${vehicleName}. I'd like to schedule a test drive or get more information about this vehicle.\`;
            document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
        }
        
        async function submitContact(event) {
            event.preventDefault();
            
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('loading');
            
            const formData = {
                vehicleId: form.vehicleId.value,
                message: form.message.value,
                contactMethod: form.contactMethod.value
            };
            
            try {
                const response = await fetch('/inventory/${shortCode}/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Show success message
                    document.getElementById('successMessage').style.display = 'block';
                    form.reset();
                    
                    // Scroll to success message
                    document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
                    
                    // Hide form after success
                    setTimeout(() => {
                        form.style.display = 'none';
                    }, 2000);
                } else {
                    alert('There was an error sending your message. Please try again or call us directly.');
                }
            } catch (error) {
                alert('There was an error sending your message. Please try again or call us directly.');
            } finally {
                submitButton.textContent = originalText;
                submitButton.classList.remove('loading');
            }
        }
    </script>
</body>
</html>
    `;
}

function generate404Page() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Not Found</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .error-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        h1 {
            color: #e74c3c;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Link Not Found</h1>
        <p>This inventory link doesn't exist or may have been removed.</p>
        <p>Please contact your sales representative for assistance.</p>
        <a href="tel:+18016809129">Call Us: (801) 680-9129</a>
    </div>
</body>
</html>
    `;
}

function generateExpiredPage() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Expired</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .error-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        h1 {
            color: #f39c12;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Link Expired</h1>
        <p>This inventory link has expired. Please contact us for updated vehicle information.</p>
        <a href="tel:+18016809129">Call Us: (801) 680-9129</a>
    </div>
</body>
</html>
    `;
}

function generateErrorPage() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .error-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        h1 {
            color: #e74c3c;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Oops! Something went wrong</h1>
        <p>We're having trouble loading your vehicle matches. Please try again later.</p>
        <a href="tel:+18016809129">Call Us: (801) 680-9129</a>
    </div>
</body>
</html>
    `;
}

module.exports = router;