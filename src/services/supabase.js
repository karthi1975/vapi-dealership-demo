const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
    constructor() {
        this.client = null;
        this.initialized = false;
        
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('✅ Supabase client initialized');
        } else {
            console.log('⚠️ Supabase credentials not found, running in placeholder mode');
        }
    }

    // Test connection
    async testConnection() {
        if (!this.initialized) {
            console.log('❌ Supabase not initialized');
            return false;
        }

        try {
            const { data, error } = await this.client
                .from('customers')
                .select('count')
                .limit(1);
            
            if (error) {
                console.log('❌ Supabase connection test failed:', error.message);
                return false;
            }
            
            console.log('✅ Supabase connection test successful');
            return true;
        } catch (error) {
            console.log('❌ Supabase connection error:', error.message);
            return false;
        }
    }

    // Create customer
    async createCustomer(customerData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping customer creation');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error creating customer:', error.message);
            return null;
        }
    }

    // Get customer by phone
    async getCustomerByPhone(phoneNumber) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping customer lookup');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error getting customer:', error.message);
            return null;
        }
    }

    // Create call record
    async createCall(callData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping call creation');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error creating call:', error.message);
            return null;
        }
    }

    // Update call record
    async updateCall(callId, updateData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping call update');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error updating call:', error.message);
            return null;
        }
    }

    // Log transfer
    async logTransfer(transferData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping transfer log');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error logging transfer:', error.message);
            return null;
        }
    }

    // Log intent
    async logIntent(intentData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping intent log');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error logging intent:', error.message);
            return null;
        }
    }

    // Log vehicle interest
    async logVehicleInterest(interestData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping vehicle interest log');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error logging vehicle interest:', error.message);
            return null;
        }
    }

    // Create test drive booking
    async createTestDriveBooking(bookingData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping test drive booking');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error creating test drive booking:', error.message);
            return null;
        }
    }

    // Create financing application
    async createFinancingApplication(applicationData) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, skipping financing application');
            return null;
        }

        try {
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
        } catch (error) {
            console.log('❌ Error creating financing application:', error.message);
            return null;
        }
    }

    // Get call analytics
    async getCallAnalytics(dateRange) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, returning empty analytics');
            return {
                totalCalls: 0,
                averageDuration: 0,
                outcomes: {},
                transfers: 0
            };
        }

        try {
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
                transfers: 0 // TODO: Add transfer count
            };
        } catch (error) {
            console.log('❌ Error getting call analytics:', error.message);
            return {
                totalCalls: 0,
                averageDuration: 0,
                outcomes: {},
                transfers: 0
            };
        }
    }

    // Get agent performance
    async getAgentPerformance(agentName, dateRange) {
        if (!this.initialized) {
            console.log('⚠️ Supabase not initialized, returning empty performance data');
            return {
                agentName,
                totalCalls: 0,
                averageDuration: 0,
                transfers: 0,
                outcomes: {}
            };
        }

        try {
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
                averageDuration: 0, // TODO: Calculate from call data
                transfers: transfers.length,
                outcomes: {}
            };
        } catch (error) {
            console.log('❌ Error getting agent performance:', error.message);
            return {
                agentName,
                totalCalls: 0,
                averageDuration: 0,
                transfers: 0,
                outcomes: {}
            };
        }
    }
}

module.exports = new SupabaseService();
