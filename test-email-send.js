require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
    console.log('📧 Testing email configuration...\n');
    
    // Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error('❌ Error: EMAIL_USER or EMAIL_APP_PASSWORD not found in .env file');
        console.log('\nPlease ensure your .env file contains:');
        console.log('EMAIL_SERVICE=gmail');
        console.log('EMAIL_USER=your.email@gmail.com');
        console.log('EMAIL_APP_PASSWORD=your-16-char-app-password');
        return;
    }
    
    console.log('✅ Credentials found');
    console.log(`📤 From: ${process.env.EMAIL_USER}`);
    console.log(`📥 To: karthi.jeyabalan@gmail.com\n`);
    
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
        
        console.log('🔄 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified\n');
        
        // Send email
        console.log('📨 Sending email...');
        const info = await transporter.sendMail({
            from: `VAPI Dealership <${process.env.EMAIL_USER}>`,
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
                            This email was sent from your VAPI Dealership system using Gmail SMTP.
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
        
    } catch (error) {
        console.error('\n❌ Failed to send email:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\n🔧 Fix: Check your app password:');
            console.log('1. Make sure 2-factor authentication is enabled on Gmail');
            console.log('2. Generate app password at: https://myaccount.google.com/apppasswords');
            console.log('3. Use the 16-character password (no spaces) in EMAIL_APP_PASSWORD');
        } else if (error.message.includes('self signed certificate')) {
            console.log('\n🔧 Fix: This might be a network issue. Try again.');
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