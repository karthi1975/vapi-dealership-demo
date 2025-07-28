const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Initialize Supabase client with service role key for migrations
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');
    
    try {
        // Read the enhanced schema migration
        const migrationPath = path.join(__dirname, '..', 'migrations', 'enhanced_schema.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        // Split into individual statements (basic split on semicolons)
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
        
        let successCount = 0;
        let skipCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';
            
            // Extract table/operation info for logging
            const tableMatch = statement.match(/(?:CREATE TABLE|ALTER TABLE|CREATE INDEX)\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
            const operation = tableMatch ? `${tableMatch[0].split(/\s+/)[0]} ${tableMatch[0].split(/\s+/)[1]} ${tableMatch[1]}` : `Statement ${i + 1}`;
            
            try {
                // Execute using Supabase's RPC or direct query
                const { error } = await supabase.rpc('exec_sql', {
                    sql: statement
                });
                
                if (error) {
                    // If error is about existing object, skip it
                    if (error.message.includes('already exists')) {
                        console.log(`⏭️  Skipped: ${operation} (already exists)`);
                        skipCount++;
                    } else {
                        console.error(`❌ Failed: ${operation}`);
                        console.error(`   Error: ${error.message}`);
                    }
                } else {
                    console.log(`✅ Success: ${operation}`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error executing ${operation}:`, err.message);
            }
        }
        
        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ⏭️  Skipped: ${skipCount}`);
        console.log(`   ❌ Failed: ${statements.length - successCount - skipCount}`);
        
        // Note about manual execution
        if (successCount === 0) {
            console.log(`\n⚠️  No statements were executed successfully.`);
            console.log(`   This might be because the exec_sql RPC function is not available.`);
            console.log(`   Please run the migration manually in the Supabase SQL editor:`);
            console.log(`   1. Go to your Supabase project dashboard`);
            console.log(`   2. Navigate to SQL Editor`);
            console.log(`   3. Copy and paste the contents of migrations/enhanced_schema.sql`);
            console.log(`   4. Execute the SQL`);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Alternative: Direct migration info without execution
async function showMigrationInfo() {
    console.log('\n📄 Migration file location:');
    console.log('   migrations/enhanced_schema.sql');
    console.log('\n🔧 To run migrations manually:');
    console.log('   1. Open Supabase Dashboard > SQL Editor');
    console.log('   2. Copy the SQL from migrations/enhanced_schema.sql');
    console.log('   3. Paste and execute in SQL Editor');
    console.log('\n📋 Tables to be created:');
    console.log('   - inventory (enhanced)');
    console.log('   - vehicle_interests');
    console.log('   - call_transcripts');
    console.log('   - communication_logs');
    console.log('   - shared_links');
    console.log('   - sales_assignments');
    console.log('   - education_campaigns');
}

// Run migrations
if (require.main === module) {
    console.log('🔍 Checking Supabase connection...');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing Supabase credentials in .env file');
        showMigrationInfo();
        process.exit(1);
    }
    
    runMigrations()
        .then(() => {
            console.log('\n✅ Migration process complete!');
            showMigrationInfo();
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Migration failed:', err);
            showMigrationInfo();
            process.exit(1);
        });
}

module.exports = { runMigrations };