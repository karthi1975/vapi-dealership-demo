const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Map condition strings to our enum values
const conditionMap = {
    'Excellent': 'certified',
    'Good': 'used',
    'Fair': 'used',
    'Needs Work': 'used'
};

// Parse features from the comment field
function parseFeatures(featuresString) {
    if (!featuresString) return [];
    return featuresString.split(',').map(f => f.trim());
}

// Convert price string to number
function parsePrice(priceString) {
    return parseFloat(priceString.replace(/[$,]/g, ''));
}

// Process and insert inventory data
async function importInventory() {
    const inventory = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream('./100 Used_Cars_Inventory.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Map CSV columns to database fields
                const item = {
                    stock_number: row['Stock ID'],
                    year: parseInt(row['Year']),
                    make: row['Make'],
                    model: row['Model'],
                    trim_level: row['Trim'],
                    mileage: parseInt(row['Mileage (mi)']),
                    price: parsePrice(row['Price ($)']),
                    condition: conditionMap[row['Condition']] || 'used',
                    color: row['Color'],
                    vin: row['VIN'],
                    description: `${row['Year']} ${row['Make']} ${row['Model']} ${row['Trim']} - ${row['Body Type']} in ${row['Condition']} condition. ${row['Notes'] || ''}`.trim(),
                    features: parseFeatures(row['Extra Features (in Comment)']),
                    images: [], // Would need to be populated from another source
                    video_url: null,
                    is_available: true,
                    location: 'Main Dealership', // Default location
                    // Additional metadata
                    fuel_type: row['Fuel Type'],
                    transmission: row['Transmission'],
                    engine: row['Engine'],
                    drivetrain: row['Drivetrain'],
                    interior_color: row['Interior'],
                    body_type: row['Body Type'],
                    previous_owners: parseInt(row['Previous Owners']),
                    service_history: row['Service History'],
                    accident_history: row['Accident History'],
                    title_status: row['Title Status']
                };
                
                inventory.push(item);
            })
            .on('end', async () => {
                console.log(`📊 Parsed ${inventory.length} vehicles from CSV`);
                
                // Insert in batches to avoid timeout
                const batchSize = 10;
                let inserted = 0;
                
                for (let i = 0; i < inventory.length; i += batchSize) {
                    const batch = inventory.slice(i, i + batchSize);
                    
                    try {
                        // Extract only the fields that match our inventory table schema
                        const cleanBatch = batch.map(item => ({
                            stock_number: item.stock_number,
                            year: item.year,
                            make: item.make,
                            model: item.model,
                            trim_level: item.trim_level,
                            mileage: item.mileage,
                            price: item.price,
                            condition: item.condition,
                            color: item.color,
                            vin: item.vin,
                            description: item.description,
                            features: item.features,
                            images: item.images,
                            video_url: item.video_url,
                            is_available: item.is_available,
                            location: item.location
                        }));
                        
                        const { data, error } = await supabase
                            .from('inventory')
                            .insert(cleanBatch)
                            .select();
                        
                        if (error) {
                            console.error(`❌ Error inserting batch ${i/batchSize + 1}:`, error);
                        } else {
                            inserted += data.length;
                            console.log(`✅ Inserted batch ${i/batchSize + 1}: ${data.length} vehicles`);
                        }
                    } catch (err) {
                        console.error(`❌ Error processing batch ${i/batchSize + 1}:`, err);
                    }
                }
                
                console.log(`\n✅ Import complete! Inserted ${inserted} vehicles total.`);
                
                // Also create a metadata table with additional fields if needed
                try {
                    // Store full metadata in a separate table if needed
                    const { error: metaError } = await supabase
                        .from('inventory_metadata')
                        .insert(inventory.map(item => ({
                            stock_number: item.stock_number,
                            fuel_type: item.fuel_type,
                            transmission: item.transmission,
                            engine: item.engine,
                            drivetrain: item.drivetrain,
                            interior_color: item.interior_color,
                            body_type: item.body_type,
                            previous_owners: item.previous_owners,
                            service_history: item.service_history,
                            accident_history: item.accident_history,
                            title_status: item.title_status
                        })));
                    
                    if (metaError && metaError.code !== '42P01') { // Table doesn't exist error
                        console.log('ℹ️ Metadata table not available, skipping extended attributes');
                    }
                } catch (err) {
                    console.log('ℹ️ Skipping metadata storage');
                }
                
                resolve(inserted);
            })
            .on('error', (err) => {
                console.error('❌ Error reading CSV:', err);
                reject(err);
            });
    });
}

// Run the import if called directly
if (require.main === module) {
    console.log('🚗 Starting inventory import...');
    importInventory()
        .then(count => {
            console.log(`🎉 Successfully imported ${count} vehicles!`);
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Import failed:', err);
            process.exit(1);
        });
}

module.exports = { importInventory };