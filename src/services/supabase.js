const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
    constructor() {
        this.client = null;
        this.initialized = false;
        this.connectionTested = false;
        
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('✅ Supabase client initialized');
        } else {
            console.log('⚠️ Supabase credentials not found, running in placeholder mode');
        }
    }

    // Test connection with timeout
    async testConnection() {
        if (!this.initialized) {
            console.log('❌ Supabase not initialized');
            return false;
        }

        if (this.connectionTested) {
            return true;
        }

        try {
            // Set a timeout for the connection test
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timeout')), 5000);
            });

            const testPromise = this.client
                .from('customers')
                .select('count')
                .limit(1);

            await Promise.race([testPromise, timeoutPromise]);
            
            console.log('✅ Supabase connection test successful');
            this.connectionTested = true;
            return true;
        } catch (error) {
            console.log('❌ Supabase connection test failed:', error.message);
            this.connectionTested = false;
            return false;
        }
    }

    // Safe database operation with fallback
    async safeOperation(operation, fallbackValue = null) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, using fallback');
            return fallbackValue;
        }

        // Test connection first
        const isConnected = await this.testConnection();
        if (!isConnected) {
            console.log('⚠️ Supabase connection failed, using fallback');
            return fallbackValue;
        }

        try {
            return await operation();
        } catch (error) {
            console.log('❌ Database operation failed:', error.message);
            return fallbackValue;
        }
    }

    // Create customer
    async createCustomer(customerData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('customers')
                .insert([customerData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error creating customer:', error.message);
                return null;
            }

            console.log('✅ Customer created:', data.id);
            return data;
        });
    }

    // Get customer by phone
    async getCustomerByPhone(phoneNumber) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('customers')
                .select('*')
                .eq('phone_number', phoneNumber)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.log('❌ Error getting customer:', error.message);
                return null;
            }

            return data || null;
        });
    }

    // Create call record
    async createCall(callData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('calls')
                .insert([callData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error creating call:', error.message);
                return null;
            }

            console.log('✅ Call created:', data.id);
            return data;
        });
    }

    // Update call record
    async updateCall(callId, updateData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('calls')
                .update(updateData)
                .eq('id', callId)
                .select()
                .single();

            if (error) {
                console.log('❌ Error updating call:', error.message);
                return null;
            }

            console.log('✅ Call updated:', callId);
            return data;
        });
    }

    // Log transfer
    async logTransfer(transferData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('call_transfers')
                .insert([transferData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error logging transfer:', error.message);
                return null;
            }

            console.log('✅ Transfer logged:', data.id);
            return data;
        });
    }

    // Log intent
    async logIntent(intentData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('customer_intents')
                .insert([intentData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error logging intent:', error.message);
                return null;
            }

            console.log('✅ Intent logged:', data.id);
            return data;
        });
    }

    // Log vehicle interest
    async logVehicleInterest(interestData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('vehicle_interests')
                .insert([interestData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error logging vehicle interest:', error.message);
                return null;
            }

            console.log('✅ Vehicle interest logged:', data.id);
            return data;
        });
    }

    // Create test drive booking
    async createTestDriveBooking(bookingData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('test_drive_bookings')
                .insert([bookingData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error creating test drive booking:', error.message);
                return null;
            }

            console.log('✅ Test drive booking created:', data.id);
            return data;
        });
    }

    // Create financing application
    async createFinancingApplication(applicationData) {
        return this.safeOperation(async () => {
            const { data, error } = await this.client
                .from('financing_applications')
                .insert([applicationData])
                .select()
                .single();

            if (error) {
                console.log('❌ Error creating financing application:', error.message);
                return null;
            }

            console.log('✅ Financing application created:', data.id);
            return data;
        });
    }

    // Get call analytics
    async getCallAnalytics(dateRange) {
        return this.safeOperation(async () => {
            const { data: calls, error } = await this.client
                .from('calls')
                .select('*')
                .gte('start_time', dateRange.start)
                .lte('start_time', dateRange.end);

            if (error) {
                console.log('❌ Error getting call analytics:', error.message);
                return {
                    totalCalls: 0,
                    averageDuration: 0,
                    outcomes: {},
                    transfers: 0
                };
            }

            const totalCalls = calls.length;
            const averageDuration = calls.reduce((sum, call) => sum + (call.call_duration || 0), 0) / totalCalls;
            const outcomes = calls.reduce((acc, call) => {
                acc[call.outcome] = (acc[call.outcome] || 0) + 1;
                return acc;
            }, {});

            return {
                totalCalls,
                averageDuration: Math.round(averageDuration),
                outcomes,
                transfers: 0
            };
        }, {
            totalCalls: 0,
            averageDuration: 0,
            outcomes: {},
            transfers: 0
        });
    }

    // Get agent performance
    async getAgentPerformance(agentName, dateRange) {
        return this.safeOperation(async () => {
            const { data: transfers, error } = await this.client
                .from('call_transfers')
                .select('*')
                .eq('to_agent', agentName)
                .gte('transfer_time', dateRange.start)
                .lte('transfer_time', dateRange.end);

            if (error) {
                console.log('❌ Error getting agent performance:', error.message);
                return {
                    agentName,
                    totalCalls: 0,
                    averageDuration: 0,
                    transfers: 0,
                    outcomes: {}
                };
            }

            return {
                agentName,
                totalCalls: transfers.length,
                averageDuration: 0,
                transfers: transfers.length,
                outcomes: {}
            };
        }, {
            agentName,
            totalCalls: 0,
            averageDuration: 0,
            transfers: 0,
            outcomes: {}
        });
    }
}

module.exports = new SupabaseService();
