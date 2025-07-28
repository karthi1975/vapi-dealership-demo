const cron = require('node-cron');
const emailService = require('./emailService');

class CommunicationScheduler {
    constructor() {
        this.jobs = [];
        this.initialized = false;
    }

    start() {
        if (this.initialized) {
            console.log('⚠️ Communication scheduler already running');
            return;
        }

        // Process pending emails every minute
        const emailJob = cron.schedule('* * * * *', async () => {
            console.log('📧 Processing pending emails...');
            await emailService.processPendingEmails();
        });
        this.jobs.push(emailJob);

        // Process pending SMS every 30 seconds
        const smsJob = cron.schedule('*/30 * * * * *', async () => {
            console.log('📱 Processing pending SMS...');
            await emailService.processPendingSMS();
        });
        this.jobs.push(smsJob);

        // Clean up old links daily at 2 AM
        const cleanupJob = cron.schedule('0 2 * * *', async () => {
            console.log('🧹 Cleaning up expired links...');
            await this.cleanupExpiredLinks();
        });
        this.jobs.push(cleanupJob);

        // Generate daily reports at 8 AM
        const reportJob = cron.schedule('0 8 * * *', async () => {
            console.log('📊 Generating daily reports...');
            await this.generateDailyReports();
        });
        this.jobs.push(reportJob);

        this.initialized = true;
        console.log('✅ Communication scheduler started');
    }

    stop() {
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        this.initialized = false;
        console.log('🛑 Communication scheduler stopped');
    }

    async cleanupExpiredLinks() {
        try {
            const { error } = await supabaseEnhanced.client
                .from('shared_links')
                .delete()
                .lt('expires_at', new Date().toISOString());
            
            if (error) throw error;
            console.log('✅ Expired links cleaned up');
        } catch (error) {
            console.error('❌ Error cleaning up links:', error);
        }
    }

    async generateDailyReports() {
        try {
            // Get yesterday's data
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Get calls from yesterday
            const { data: calls } = await supabaseEnhanced.client
                .from('calls')
                .select('*')
                .gte('created_at', yesterday.toISOString())
                .lt('created_at', today.toISOString());
            
            // Get leads from yesterday
            const { data: leads } = await supabaseEnhanced.client
                .from('customers')
                .select('*')
                .gte('created_at', yesterday.toISOString())
                .lt('created_at', today.toISOString());
            
            // Generate report content
            const reportContent = `
<h2>Daily Dealership Report - ${yesterday.toLocaleDateString()}</h2>

<h3>📞 Call Summary</h3>
<ul>
    <li>Total Calls: ${calls?.length || 0}</li>
    <li>Qualified Leads: ${calls?.filter(c => c.outcome === 'qualified').length || 0}</li>
    <li>Test Drives Scheduled: ${calls?.filter(c => c.outcome === 'test_drive').length || 0}</li>
</ul>

<h3>👥 New Customers</h3>
<ul>
    <li>Total New Customers: ${leads?.length || 0}</li>
    <li>With Email: ${leads?.filter(l => l.email).length || 0}</li>
    <li>With Budget > $30k: ${leads?.filter(l => l.budget > 30000).length || 0}</li>
</ul>

<h3>🚗 Popular Vehicles</h3>
<p>Analysis of customer interests from yesterday's calls.</p>

<p>Full analytics available in the dashboard.</p>
            `;
            
            // Send report to managers
            const managers = process.env.MANAGER_EMAILS?.split(',') || [];
            for (const managerEmail of managers) {
                await emailService.sendEmail(
                    managerEmail.trim(),
                    `Daily Report - ${yesterday.toLocaleDateString()}`,
                    reportContent
                );
            }
            
            console.log('✅ Daily reports sent');
        } catch (error) {
            console.error('❌ Error generating reports:', error);
        }
    }
}

module.exports = new CommunicationScheduler();