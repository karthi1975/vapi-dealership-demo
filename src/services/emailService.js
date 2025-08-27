const nodemailer = require('nodemailer');
const supabaseEnhanced = require('./supabaseEnhanced');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Skip initialization if email service is disabled
            if (!process.env.EMAIL_SERVICE || process.env.EMAIL_SERVICE === 'disabled') {
                console.log('⚠️ Email service is disabled');
                return;
            }
            
            // Configure email transporter based on environment
            if (process.env.EMAIL_SERVICE === 'gmail') {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_APP_PASSWORD
                    }
                });
            } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
                this.transporter = nodemailer.createTransporter({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    auth: {
                        user: 'apikey',
                        pass: process.env.SENDGRID_API_KEY
                    }
                });
            } else if (process.env.EMAIL_SERVICE === 'smtp') {
                // Only configure SMTP if credentials are provided
                if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                    this.transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT || 587,
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS
                        }
                    });
                } else {
                    console.log('⚠️ SMTP configured but missing credentials - email service disabled');
                }
            }

            if (this.transporter) {
                await this.transporter.verify();
                this.initialized = true;
                console.log('✅ Email service initialized');
            } else {
                console.log('⚠️ Email service not configured');
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error);
        }
    }

    // Send email with retry logic
    async sendEmail(to, subject, content, options = {}) {
        if (!this.initialized) {
            console.log('⚠️ Email service not initialized');
            return null;
        }

        const mailOptions = {
            from: options.from || process.env.EMAIL_FROM || 'noreply@dealership.com',
            to: to,
            subject: subject,
            html: this.formatEmailContent(content, options.template),
            text: this.stripHtml(content),
            ...options.additionalHeaders
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Email send failed:', error);
            throw error;
        }
    }

    // Format email content with template
    formatEmailContent(content, template = 'default') {
        const templates = {
            default: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        .vehicle-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Dealership</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2024 Your Dealership. All rights reserved.</p>
            <p>123 Main St, City, State 12345 | (555) 123-4567</p>
        </div>
    </div>
</body>
</html>`,
            education: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Georgia, serif; line-height: 1.8; color: #444; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px; }
        .tip { background-color: #ecf0f1; padding: 15px; margin: 15px 0; border-left: 4px solid #e74c3c; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Car Buying Tips & Education</h2>
        </div>
        ${content}
        <div class="footer">
            <p>This educational content is provided by Your Dealership</p>
            <p>Questions? Reply to this email or call us at (555) 123-4567</p>
        </div>
    </div>
</body>
</html>`
        };

        return templates[template] || templates.default;
    }

    // Strip HTML for plain text version
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    // Process pending emails from database
    async processPendingEmails() {
        if (!this.initialized) return;

        try {
            const pendingEmails = await supabaseEnhanced.getPendingCommunications();
            
            for (const email of pendingEmails) {
                if (email.type !== 'email' && email.type !== 'education') continue;
                
                try {
                    // Parse metadata for template selection
                    const template = email.metadata?.template || (email.type === 'education' ? 'education' : 'default');
                    
                    // Get customer email
                    const { data: customer } = await supabaseEnhanced.client
                        .from('customers')
                        .select('email')
                        .eq('id', email.customer_id)
                        .single();
                    
                    if (!customer?.email) {
                        console.log(`⚠️ No email address for customer ${email.customer_id}`);
                        await supabaseEnhanced.updateCommunicationStatus(email.id, 'failed');
                        continue;
                    }
                    
                    // Send email
                    await this.sendEmail(
                        customer.email,
                        email.subject,
                        email.content,
                        { template }
                    );
                    
                    // Update status
                    await supabaseEnhanced.updateCommunicationStatus(
                        email.id,
                        'sent',
                        new Date().toISOString()
                    );
                    
                } catch (error) {
                    console.error(`❌ Failed to send email ${email.id}:`, error);
                    await supabaseEnhanced.updateCommunicationStatus(email.id, 'failed');
                }
            }
        } catch (error) {
            console.error('❌ Error processing pending emails:', error);
        }
    }

    // Send SMS (placeholder - would integrate with Twilio)
    async sendSMS(to, message) {
        console.log(`📱 SMS to ${to}: ${message}`);
        // In production, integrate with Twilio or similar service
        return { success: true, mockDelivery: true };
    }

    // Process pending SMS
    async processPendingSMS() {
        try {
            const pendingSMS = await supabaseEnhanced.getPendingCommunications();
            
            for (const sms of pendingSMS) {
                if (sms.type !== 'sms') continue;
                
                try {
                    // Get customer phone
                    const { data: customer } = await supabaseEnhanced.client
                        .from('customers')
                        .select('phone_number')
                        .eq('id', sms.customer_id)
                        .single();
                    
                    if (!customer?.phone_number) {
                        console.log(`⚠️ No phone number for customer ${sms.customer_id}`);
                        await supabaseEnhanced.updateCommunicationStatus(sms.id, 'failed');
                        continue;
                    }
                    
                    // Send SMS
                    await this.sendSMS(customer.phone_number, sms.content);
                    
                    // Update status
                    await supabaseEnhanced.updateCommunicationStatus(
                        sms.id,
                        'sent',
                        new Date().toISOString()
                    );
                    
                } catch (error) {
                    console.error(`❌ Failed to send SMS ${sms.id}:`, error);
                    await supabaseEnhanced.updateCommunicationStatus(sms.id, 'failed');
                }
            }
        } catch (error) {
            console.error('❌ Error processing pending SMS:', error);
        }
    }
}

module.exports = new EmailService();