require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
    console.log('📧 Testing email configuration...\n');
    
    // Check configuration
    console.log('Current configuration:');
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log('');
    
    // Check if we need credentials
    if (process.env.EMAIL_SERVICE === 'smtp' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
        console.error('❌ Error: SMTP_USER or SMTP_PASS not found in .env file\n');
        console.log('To use Gmail SMTP, add to your .env file:');
        console.log('SMTP_USER=your.email@gmail.com');
        console.log('SMTP_PASS=your-16-character-app-password\n');
        console.log('To get an app password:');
        console.log('1. Enable 2-factor authentication on your Google account');
        console.log('2. Go to: https://myaccount.google.com/apppasswords');
        console.log('3. Generate an app password for "Mail"');
        console.log('4. Copy the 16-character password (remove spaces)');
        return;
    }
    
    try {
        let transporter;
        
        if (process.env.EMAIL_SERVICE === 'gmail') {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
                console.error('❌ Error: EMAIL_USER or EMAIL_APP_PASSWORD not found');
                return;
            }
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });
        } else if (process.env.EMAIL_SERVICE === 'smtp') {
            transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: process.env.SMTP_USER ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                } : undefined
            });
        } else {
            console.error('❌ Error: EMAIL_SERVICE must be "gmail" or "smtp"');
            return;
        }
        
        console.log('🔄 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified\n');
        
        // Send email
        console.log('📨 Sending test email to karthi.jeyabalan@gmail.com...');
        const info = await transporter.sendMail({
            from: `VAPI Dealership <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: 'karthi.jeyabalan@gmail.com',
            subject: 'Test Email from VAPI Dealership',
            text: 'Hello from VAPI dealership!\n\nThis is a test email to confirm your email configuration is working correctly.\n\nBest regards,\nVAPI Dealership Team',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
                        <h1>VAPI Dealership</h1>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <h2>Hello from VAPI dealership!</h2>
                        <p>This is a test email to confirm your email configuration is working correctly.</p>
                        <p style="color: #27ae60;"><strong>✅ Email system is working!</strong></p>
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #666; font-size: 14px;">
                            Configuration used: ${process.env.EMAIL_SERVICE.toUpperCase()}
                        </p>
                    </div>
                    <div style="background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px;">
                        <p>© 2024 VAPI Dealership. Test Email.</p>
                    </div>
                </div>
            `
        });
        
        console.log('\n✅ Email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`✉️  Check inbox: karthi.jeyabalan@gmail.com`);
        console.log(`📤 Sent from: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
        
    } catch (error) {
        console.error('\n❌ Failed to send email:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔧 Authentication failed. Please check:');
            console.log('1. Your email credentials are correct');
            console.log('2. You are using an app password (not your regular password)');
            console.log('3. 2-factor authentication is enabled on your Google account');
        }
    }
}

// Run the test
console.log('🚀 VAPI Dealership Email Test\n');
sendTestEmail()
    .then(() => {
        console.log('\n✅ Test complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n💥 Test failed:', err);
        process.exit(1);
    });