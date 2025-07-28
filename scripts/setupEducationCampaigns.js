const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const educationCampaigns = [
    // Buyer Tips Series
    {
        name: 'Buyer Tip #1: Research Before You Shop',
        type: 'buyer_tips',
        sequence_order: 1,
        subject: '🚗 Car Buying Tip #1: Do Your Research First',
        delay_days: 1,
        content: `
<h3>Smart Car Buying Starts with Research</h3>

<div class="tip">
<strong>Tip #1:</strong> Before visiting dealerships, spend time researching online to understand:
</div>

<ul>
<li><strong>Market Prices:</strong> Check multiple sources for the fair market value of your desired vehicle</li>
<li><strong>Reliability Ratings:</strong> Look up Consumer Reports and J.D. Power ratings</li>
<li><strong>Common Issues:</strong> Search for known problems with specific years and models</li>
<li><strong>Fuel Economy:</strong> Compare real-world MPG from actual owners</li>
</ul>

<p><strong>Pro Tip:</strong> Create a spreadsheet comparing your top 3-5 choices with price, features, and ratings.</p>

<p>Knowledge is power in negotiations. The more you know, the better deal you'll get!</p>
        `
    },
    {
        name: 'Buyer Tip #2: Timing Your Purchase',
        type: 'buyer_tips',
        sequence_order: 2,
        subject: '🚗 Car Buying Tip #2: When to Buy for Best Deals',
        delay_days: 3,
        content: `
<h3>The Best Times to Buy a Car</h3>

<div class="tip">
<strong>Tip #2:</strong> Timing can save you thousands on your purchase.
</div>

<h4>Best Times to Buy:</h4>
<ul>
<li><strong>End of Month:</strong> Salespeople have quotas to meet</li>
<li><strong>End of Quarter:</strong> Dealerships push for quarterly goals</li>
<li><strong>October-December:</strong> Year-end clearances for new models</li>
<li><strong>Monday-Tuesday:</strong> Less busy, more negotiating time</li>
</ul>

<h4>Avoid These Times:</h4>
<ul>
<li>Weekends (busiest time, less flexibility)</li>
<li>Spring/Summer (peak buying season)</li>
<li>When you're desperate (dealers can sense urgency)</li>
</ul>

<p><strong>Remember:</strong> A patient buyer is a smart buyer!</p>
        `
    },
    {
        name: 'Buyer Tip #3: Test Drive Like a Pro',
        type: 'buyer_tips',
        sequence_order: 3,
        subject: '🚗 Car Buying Tip #3: Master the Test Drive',
        delay_days: 5,
        content: `
<h3>How to Test Drive Like an Expert</h3>

<div class="tip">
<strong>Tip #3:</strong> A proper test drive reveals more than a quick spin around the block.
</div>

<h4>Your Test Drive Checklist:</h4>
<ul>
<li>✓ Drive in various conditions (highway, city, parking)</li>
<li>✓ Test all features (AC, radio, windows, seats)</li>
<li>✓ Listen for unusual noises</li>
<li>✓ Check blind spots and visibility</li>
<li>✓ Test acceleration and braking</li>
<li>✓ Try parallel parking</li>
</ul>

<h4>Bring a Friend:</h4>
<p>They can check things while you focus on driving and ask questions you might forget.</p>

<p><strong>Pro Tip:</strong> Test drive your top 2-3 choices back-to-back for easier comparison.</p>
        `
    },
    
    // Financing Education Series
    {
        name: 'Finance Tip #1: Know Your Credit Score',
        type: 'financing',
        sequence_order: 1,
        subject: '💰 Financing Tip #1: Your Credit Score Matters',
        delay_days: 2,
        content: `
<h3>Understanding Your Credit Score's Impact</h3>

<div class="tip">
<strong>Finance Tip #1:</strong> Your credit score directly affects your interest rate and monthly payment.
</div>

<h4>Credit Score Ranges:</h4>
<ul>
<li><strong>750+:</strong> Excellent - Best rates available</li>
<li><strong>700-749:</strong> Good - Competitive rates</li>
<li><strong>650-699:</strong> Fair - Higher rates</li>
<li><strong>Below 650:</strong> May need co-signer</li>
</ul>

<h4>How Rates Affect Payments:</h4>
<p>On a $30,000 loan:</p>
<ul>
<li>3% APR = $539/month</li>
<li>6% APR = $580/month</li>
<li>10% APR = $637/month</li>
</ul>

<p><strong>Action Step:</strong> Check your credit score for free at annualcreditreport.com before shopping.</p>
        `
    },
    {
        name: 'Finance Tip #2: Down Payment Strategy',
        type: 'financing',
        sequence_order: 2,
        subject: '💰 Financing Tip #2: Smart Down Payment Planning',
        delay_days: 4,
        content: `
<h3>How Much Should You Put Down?</h3>

<div class="tip">
<strong>Finance Tip #2:</strong> A larger down payment saves money but isn't always necessary.
</div>

<h4>Benefits of 20% Down:</h4>
<ul>
<li>Lower monthly payments</li>
<li>Less interest paid overall</li>
<li>Better loan approval odds</li>
<li>Avoid being "upside down"</li>
</ul>

<h4>When Less Makes Sense:</h4>
<ul>
<li>0% APR promotional offers</li>
<li>When you can invest the money for higher returns</li>
<li>If it depletes your emergency fund</li>
</ul>

<p><strong>Rule of Thumb:</strong> Put down at least 10% if possible, but keep 3-6 months expenses in savings.</p>
        `
    },
    
    // Maintenance Guide Series
    {
        name: 'Maintenance Tip #1: Essential First 1000 Miles',
        type: 'maintenance',
        sequence_order: 1,
        subject: '🔧 New Car Care: The First 1000 Miles',
        delay_days: 7,
        content: `
<h3>Breaking In Your New Vehicle</h3>

<div class="tip">
<strong>Maintenance Tip #1:</strong> The first 1000 miles set the foundation for your car's longevity.
</div>

<h4>Break-In Best Practices:</h4>
<ul>
<li>Vary your speed (avoid cruise control)</li>
<li>Avoid hard acceleration or braking</li>
<li>Don't tow during break-in period</li>
<li>Check fluids weekly</li>
</ul>

<h4>First Service Checklist:</h4>
<ul>
<li>Oil change (even if not due)</li>
<li>Tire pressure and rotation</li>
<li>All fluid levels</li>
<li>Battery connections</li>
</ul>

<p><strong>Remember:</strong> Following break-in procedures can add years to your engine life!</p>
        `
    },
    {
        name: 'Maintenance Tip #2: DIY vs Professional Service',
        type: 'maintenance',
        sequence_order: 2,
        subject: '🔧 Car Care: What You Can Do Yourself',
        delay_days: 14,
        content: `
<h3>Save Money with Basic DIY Maintenance</h3>

<div class="tip">
<strong>Maintenance Tip #2:</strong> Some maintenance tasks are easy DIY projects that save money.
</div>

<h4>Easy DIY Tasks:</h4>
<ul>
<li>✓ Air filter replacement (save $20-40)</li>
<li>✓ Windshield wipers (save $15-25)</li>
<li>✓ Battery terminal cleaning</li>
<li>✓ Tire pressure checks</li>
<li>✓ Windshield washer fluid</li>
</ul>

<h4>Leave to Professionals:</h4>
<ul>
<li>Brake work (safety critical)</li>
<li>Transmission service</li>
<li>Engine diagnostics</li>
<li>Airbag/safety systems</li>
</ul>

<p><strong>Pro Tip:</strong> YouTube has great tutorials for basic maintenance tasks!</p>
        `
    }
];

async function setupEducationCampaigns() {
    console.log('📚 Setting up education campaigns...');
    
    try {
        // Insert campaigns
        const { data, error } = await supabase
            .from('education_campaigns')
            .upsert(educationCampaigns, { 
                onConflict: 'name',
                ignoreDuplicates: false 
            })
            .select();
        
        if (error) {
            console.error('❌ Error inserting campaigns:', error);
            return;
        }
        
        console.log(`✅ Successfully set up ${data.length} education campaigns`);
        
        // Display campaign schedule
        console.log('\n📅 Campaign Schedule:');
        educationCampaigns.forEach(campaign => {
            console.log(`  Day ${campaign.delay_days}: ${campaign.name}`);
        });
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Run if called directly
if (require.main === module) {
    setupEducationCampaigns()
        .then(() => {
            console.log('\n✅ Education campaigns setup complete!');
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Setup failed:', err);
            process.exit(1);
        });
}

module.exports = { setupEducationCampaigns };